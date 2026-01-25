export function formatDateHuman(date) {
  const d = new Date(date);
  const day = d.getDate();

  const suffix =
    day > 3 && day < 21
      ? "th"
      : day % 10 === 1
        ? "st"
        : day % 10 === 2
          ? "nd"
          : day % 10 === 3
            ? "rd"
            : "th";

  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
}
export function getSlug(category) {
  switch (category) {
    case "JavaScript":
      return "javascript";
    case "CSS & Design":
      return "css-design";
    case "Node.js":
      return "nodejs";
    case "Databases":
      return "databases";
    case "Productivity":
      return "productivity";
    case "Tutorials":
      return "tutorials";
    default:
      return category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
  }
}
