export const headerLinks = [
  {
    label: "About Us",
    route: "/about",
  },
  {
    label: "Success Stories",
    route: "/success",
  },
  {
    label: "Contact Us",
    route: "/contact",
  },
];

export const eventDefaultValues = {
  title: "",
  description: "",
  location: "",
  imageUrl: "",
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: "",
  price: {
    adult: "",
    kids: "",
    infant: "",
  },
  isFree: false,
  url: "",
};
