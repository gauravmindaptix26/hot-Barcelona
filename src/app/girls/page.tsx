import GirlsClient from "./girls-client";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ApiGirl = {
  _id: string;
  name?: string;
  age?: number | null;
  location?: string;
  images?: string[];
  createdAt?: Date;
};

export default async function GirlsPage() {
  const db = await getDb();
  const items = await db
    .collection("girls")
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const initialProfiles = items.map((item) => {
    const images = Array.isArray(item.images) && item.images.length
      ? item.images
      : ["/images/hot1.webp"];
    return {
      id: `db-${item._id.toString()}`,
      name: item.name ?? "New",
      age: item.age ?? 0,
      location: item.location ?? "Barcelona",
      rating: 4.7,
      reviews: 0,
      status: "New profile",
      image: images[0],
      tag: "New",
      about:
        "Fresh profile added by the model. Details and preferences will be updated soon.",
      details: {
        height: "—",
        body: "—",
        hair: "—",
        eyes: "—",
        nationality: "—",
        languages: "—",
      },
      style: {
        fashion: "Classic",
        personality: ["New", "Private", "Charming"],
        vibe: ["Fresh", "Glow", "Night"],
      },
      services: ["Private time", "Events"],
      availability: {
        days: "Mon - Sun",
        hours: "00:00 - 23:59",
        travel: "No",
      },
      gallery: images,
    };
  });

  return <GirlsClient initialProfiles={initialProfiles} />;
}
