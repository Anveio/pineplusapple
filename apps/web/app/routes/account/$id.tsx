import { Link, useParams } from "@remix-run/react";

export default function NoteIndexPage() {
  const { id } = useParams();
  return (
    <>
      <p>{id}</p>
      <p>Your name</p>
    </>
  );
}
