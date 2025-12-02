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

const Steps = ({ steps, currentStep }: StepsProps) => {
  return (
    <ol className="flex flex-col gap-6 md:flex-row md:items-center">
      {steps.map((step, index) => {
        const status =
          index < currentStep
            ? "complete"
            : index === currentStep
              ? "current"
              : "upcoming"

        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.label}
            className={cn(
              "relative flex items-center",
              !isLast && "flex-1"
            )}
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors leading-none",
                status === "complete" ? "border-emerald-500 bg-emerald-500 text-white" :
                  status === "current" ? "border-blue-600 text-blue-600" :
                    "border-slate-200 text-slate-400"
              )}>
                {status === "complete" ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-semibold whitespace-nowrap",
                  status === "upcoming" ? "text-slate-500" : "text-slate-900"
                )}>
                  {step.label}
                </span>
                {step.helper && (
                  <span className="text-xs text-slate-500 whitespace-nowrap">{step.helper}</span>
                )}
              </div>
            </div>

            {!isLast && (
              <div className={cn(
                "hidden h-0.5 w-full mx-4 md:block",
                status === "complete" ? "bg-emerald-500" : "bg-slate-200"
              )} />
            )}

            {/* Mobile Line (Vertical) */}
            {!isLast && (
              <div className={cn(
                "absolute left-4 top-8 -ml-px h-6 w-0.5 bg-slate-200 md:hidden",
                status === "complete" && "bg-emerald-500"
              )} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Steps }
