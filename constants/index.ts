export const headerLinks = [
  {
    label: "আমাদের সম্পর্কে",
    route: "/about",
  },
  {
    label: "যোগাযোগ",
    route: "/contact",
  },
  {
    label: "আমার ক্লাসগুলো",
    route: "/registration",
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
