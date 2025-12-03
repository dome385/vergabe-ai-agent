package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/golang-jwt/jwt/v5"
)

const ContextUserIDKey = "user_id"

func AuthMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		authHeader := string(c.GetHeader("Authorization"))
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"error": "Missing Authorization header"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"error": "Invalid Authorization header format"})
			return
		}

		tokenString := parts[1]
		secret := os.Getenv("SUPABASE_JWT_SECRET")
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{"error": "Server misconfiguration"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token claims"})
			return
		}

		sub, ok := claims["sub"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{"error": "Token missing sub claim"})
			return
		}

		c.Set(ContextUserIDKey, sub)
		c.Next(ctx)
	}
}
