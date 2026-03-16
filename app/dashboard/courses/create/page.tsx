import CourseForm from "../../components/CourseForm";

const CreatePage = async () => {

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Add a New Course</h2>
      <CourseForm type="Create" />
    </section>
  );
};

export default CreatePage;
