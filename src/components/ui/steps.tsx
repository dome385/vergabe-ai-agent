"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type StepItem = {
  label: string
  helper?: string
  icon?: React.ReactNode
}

type StepsProps = {
  steps: StepItem[]
  currentStep: number
}

const circleClasses = {
  complete: "text-emerald-500",
  current: "text-blue-600",
  upcoming: "text-slate-300",
}

const Steps = ({ steps, currentStep }: StepsProps) => {
  return (
    <ol className="flex flex-col gap-5 md:flex-row md:items-center">
      {steps.map((step, index) => {
        const status =
          index < currentStep
            ? "complete"
            : index === currentStep
              ? "current"
              : "upcoming"
        const progressValue = status === "complete" ? 100 : status === "current" ? 60 : 0
        return (
          <li key={step.label} className="flex items-center gap-3 md:flex-1">
            <MatchCircle
              value={progressValue}
              className={circleClasses[status as keyof typeof circleClasses]}
              label={String(index + 1)}
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  status === "upcoming" ? "text-slate-400" : "text-slate-700"
                )}
              >
                {step.label}
              </span>
              {step.helper && (
                <span className="text-xs text-slate-500">{step.helper}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="hidden flex-1 items-center md:flex">
                <span className="h-px w-full bg-gradient-to-r from-blue-200 via-blue-300 to-transparent" />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

type MatchCircleProps = {
  value: number
  label: string
  className?: string
}

const MatchCircle = ({ value, label, className }: MatchCircleProps) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - ((value ?? 0) / 100) * circumference

  return (
    <div className={cn("relative size-12 shrink-0", className)}>
      <svg className="size-12 -rotate-90 transform text-slate-200">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          className="text-slate-200"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "text-emerald-500 transition-all duration-500 ease-out",
            className
          )}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-semibold text-slate-800">
        {label}
      </span>
    </div>
  )
}

export { Steps }

