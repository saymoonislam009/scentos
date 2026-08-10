<<<<<<< Updated upstream
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
=======
import { BottleMark } from '@/components/BottleMark';
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <BottleMark className="h-7 w-7 text-gold/70 animate-pulse" />
>>>>>>> Stashed changes
    </div>
  );
}
