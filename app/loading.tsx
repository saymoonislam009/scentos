import { BottleMark } from '@/components/BottleMark';
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <BottleMark className="h-7 w-7 text-gold/70 animate-pulse" />
    </div>
  );
}
