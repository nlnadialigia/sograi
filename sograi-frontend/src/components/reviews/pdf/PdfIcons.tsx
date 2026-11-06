import React from "react"
import { Svg, Path, Circle } from "@react-pdf/renderer"

export const PdfCheckIcon = ({ size = 12 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#16a34a" />
    <Path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth={2.5} fill="none" />
  </Svg>
)

export const PdfCrossIcon = ({ size = 12 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#dc2626" />
    <Path d="M15 9l-6 6M9 9l6 6" stroke="#ffffff" strokeWidth={2.5} fill="none" />
  </Svg>
)

export const PdfFileIcon = ({ size = 12 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f59e0b" />
    <Path d="M14 2v6h6" fill="#d97706" />
  </Svg>
)

export const PdfPaletteIcon = ({ size = 10 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#8b5cf6" />
    <Path d="M8 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4-2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#ffffff" />
  </Svg>
)

export const PdfShieldIcon = ({ size = 10 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="#ef4444" />
    <Path d="M12 6v12c3.5-1 6-4.5 6-9V8.5L12 6z" fill="#b91c1c" />
  </Svg>
)

export const PdfZapIcon = ({ size = 10 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#f59e0b" />
  </Svg>
)

export const PdfFlaskIcon = ({ size = 10 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 3h6v2H9zm1 3h4l5 11a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3z" fill="#06b6d4" />
    <Path d="M7 16h10l-1.5-3.5h-7z" fill="#0891b2" />
  </Svg>
)

export const PdfAlertIcon = ({ size = 10, color = "#d97706" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2L1 21h22L12 2z" fill={color} />
    <Path d="M12 9v5m0 3v.01" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
  </Svg>
)

export const PdfLightbulbIcon = ({ size = 10 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={10} r={6} fill="#3b82f6" />
    <Path d="M9 16h6m-5 3h4" stroke="#1d4ed8" strokeWidth={1.5} />
  </Svg>
)
