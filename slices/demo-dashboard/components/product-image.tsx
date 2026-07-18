import Image from "next/image";

const productImages: Record<string, string> = {
  "Nasi Ayam": "/assets/products/nasi-ayam.png",
  "Es Teh": "/assets/products/es-teh.png",
  "Ayam Goreng": "/assets/products/ayam-goreng.png",
  "Nasi Putih": "/assets/products/nasi-putih.png",
  "Sambal Extra": "/assets/products/sambal-extra.png",
};

export function ProductImage({ name }: { name: string }) {
  return (
    <Image
      alt=""
      className="product-image"
      height={46}
      src={productImages[name] ?? "/assets/brand/temanusaha-mark.png"}
      width={46}
    />
  );
}
