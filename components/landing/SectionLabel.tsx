export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 mb-[10px]">
      <div className="w-[22px] h-[2.5px] bg-primary rounded-[2px]" />
      <span className="text-[12px] font-bold tracking-[0.1em] text-primary uppercase">{children}</span>
    </div>
  )
}
