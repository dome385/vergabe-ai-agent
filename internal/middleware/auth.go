package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/golang-jwt/jwt/v5"
)

const ContextUserIDKey = "user_id"

// AuthMiddleware validates Supabase JWT tokens and injects the user id into the request context.
func AuthMiddleware() app.HandlerFunc {
	secret := os.Getenv("SUPABASE_JWT_SECRET")
	return func(ctx context.Context, c *app.RequestContext) {
		if secret == "" {
			c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "authentication misconfiguration",
			})
			c.Abort()
			return
		}

		header := strings.TrimSpace(string(c.GetHeader(consts.HeaderAuthorization)))
		if header == "" {
			abortUnauthorized(c, "missing authorization header")
			return
		}

		tokenString, ok := strings.CutPrefix(header, "Bearer ")
		if !ok || strings.TrimSpace(tokenString) == "" {
			abortUnauthorized(c, "invalid authorization header format")
			return
		}

		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, jwt.ErrTokenSignatureInvalid
			}
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			abortUnauthorized(c, "invalid token")
			return
		}
		if claims.Subject == "" {
			abortUnauthorized(c, "missing subject in token")
			return
		}

		c.Set(ContextUserIDKey, claims.Subject)
		c.Next(ctx)
	}
}

func abortUnauthorized(c *app.RequestContext, message string) {
	c.JSON(http.StatusUnauthorized, map[string]string{
		"error": message,
	})
	c.Abort()
}
