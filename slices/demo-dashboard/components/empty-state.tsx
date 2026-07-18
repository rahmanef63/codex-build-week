import Image from "next/image";

export function EmptyState({ image, text }: { image: string; text: string }) {
  return (
    <div className="empty-state">
      <Image alt="" height={150} src={image} width={150} />
      <p>{text}</p>
    </div>
  );
}
