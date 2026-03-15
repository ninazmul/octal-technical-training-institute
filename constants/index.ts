export const headerLinks = [
  {
    label: "আমাদের সম্পর্কে",
    route: "/about",
  },
  {
    label: "সাফল্যের গল্প",
    route: "/success",
  },
  {
    label: "যোগাযোগ",
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
