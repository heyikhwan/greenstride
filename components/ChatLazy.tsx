"use client";

import dynamic from "next/dynamic";

// Peluncur chat tersembunyi sampai komponen aktif (lihat data-intro di Chat.tsx), jadi tidak ada yang hilang bila tidak dirender di server.
// Dimuat terpisah setelah halaman aktif agar kodenya tidak ikut memperlambat muatan pertama.
const Chat = dynamic(() => import("./Chat"), { ssr: false });

export default function ChatLazy() {
  return <Chat />;
}
