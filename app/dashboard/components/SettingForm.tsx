"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Path } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/shared/FileUploader";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { useUploadThing } from "@/lib/uploadthing";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { HexColorPicker } from "react-colorful";

/* ---------- helpers ---------- */

const optionalString = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().email().optional(),
);

const optionalUrl = z.preprocess(
  (v) => (v === null || v === "" ? undefined : v),
  z.string().url().optional(),
);

// ================= Zod Schema =================
export const settingSchema = z.object({
  logo: optionalString,
  favicon: optionalString,
  name: optionalString,
  tagline: optionalString,
  description: optionalString,

  email: optionalEmail,
  phoneNumber: optionalString,
  address: optionalString,
  theme: optionalString,

  facebook: optionalUrl,
  instagram: optionalUrl,
  twitter: optionalUrl,
  facebookGroup: optionalUrl,
  youtube: optionalUrl,

  returnPolicy: optionalString,
  termsOfService: optionalString,
  privacyPolicy: optionalString,

  hero: z
    .object({
      title: optionalString,
      description: optionalString,
      image: optionalString,
      offerStartDate: optionalString,
      offerEndDate: optionalString,
    })
    .optional(),

  popup: z
    .object({
      image: optionalString,
      offerStartDate: optionalString,
      offerEndDate: optionalString,
    })
    .optional(),

  features: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,

      items: z
        .array(
          z.object({
            title: optionalString,
            description: optionalString,
            icon: optionalString,
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      items: [],
    }),

  testimonials: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,

      totalEnrollment: z.number().default(0),
      totalSucceededStudents: z.number().default(0),
      totalIndustryExperts: z.number().default(0),

      feedbacks: z
        .array(
          z.object({
            name: optionalString,
            photo: optionalString,
            rating: z.number().optional(),
            comment: optionalString,
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      totalEnrollment: 0,
      totalSucceededStudents: 0,
      totalIndustryExperts: 0,
      feedbacks: [],
    }),

  ourMentors: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,
      mentors: z
        .array(
          z.object({
            name: optionalString,
            photo: optionalString,
            expertise: optionalString,
            social: z.object({
              facebook: optionalUrl,
              linkedIn: optionalUrl,
              twitter: optionalUrl,
              other: optionalUrl,
            }),
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      mentors: [],
    }),

  partners: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,

      logos: z
        .array(
          z.object({
            name: optionalString,
            photo: optionalString,
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      logos: [],
    }),

  faqs: z
    .object({
      badge: optionalString,
      title: optionalString,
      description: optionalString,
      items: z
        .array(
          z.object({
            question: optionalString,
            answer: optionalString,
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      items: [],
    }),
});

export type SettingFormValues = z.infer<typeof settingSchema>;

type Props = {
  initialData?: Partial<SettingFormValues>;
  onSubmit: (data: SettingFormValues) => Promise<void>;
};

// ================= Full Setting Form =================
export default function SettingForm({ initialData, onSubmit }: Props) {
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: settingSchema.parse(initialData ?? {}),
  });

  // Features.items array
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features.items",
  });

  // Testimonials.feedbacks array
  const {
    fields: feedbackFields,
    append: appendFeedback,
    remove: removeFeedback,
  } = useFieldArray({
    control: form.control,
    name: "testimonials.feedbacks",
  });

  // OurMentors.mentors array
  const {
    fields: mentorFields,
    append: appendMentor,
    remove: removeMentor,
  } = useFieldArray({
    control: form.control,
    name: "ourMentors.mentors",
  });

  // Partners.logos array
  const {
    fields: logoFields,
    append: appendLogo,
    remove: removeLogo,
  } = useFieldArray({
    control: form.control,
    name: "partners.logos",
  });

  // FAQs.items array
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "faqs.items",
  });

  const saveField = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    try {
      await onSubmit(form.getValues());
      toast.success("Settings saved!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6 max-w-5xl mx-auto p-6 bg-white rounded shadow">
        <Accordion type="single" collapsible defaultValue="branding">
          {/* ===== Branding & Contact ===== */}
          <AccordionItem value="branding">
            <AccordionTrigger>Branding & Contact</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo *</FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value || ""}
                          onFieldChange={async (_blobUrl, files) => {
                            if (files?.length) {
                              const uploaded = await startUpload(files);
                              if (uploaded?.[0]) {
                                form.setValue("logo", uploaded[0].url, {
                                  shouldValidate: true,
                                });
                                saveField();
                              }
                            }
                          }}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Favicon */}
                <FormField
                  control={form.control}
                  name="favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon *</FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value || ""}
                          onFieldChange={async (_blobUrl, files) => {
                            if (files?.length) {
                              const uploaded = await startUpload(files);
                              if (uploaded?.[0]) {
                                form.setValue("favicon", uploaded[0].url, {
                                  shouldValidate: true,
                                });
                                saveField();
                              }
                            }
                          }}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Site Name & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Site name"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tagline"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={(val) => {
                          field.onChange(val);
                          saveField();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Phone number"
                          {...field}
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} onBlur={saveField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Theme Picker */}
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {/* Color Picker */}
                        <HexColorPicker
                          color={field.value || "#000000"}
                          onChange={(color) => {
                            field.onChange(color);
                            saveField();
                          }}
                        />

                        {/* Color Preview */}
                        <div
                          className="w-12 h-12 rounded border"
                          style={{ backgroundColor: field.value || "#000000" }}
                        />

                        {/* Hex Input */}
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-20 text-sm"
                          value={field.value || "#000000"}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Optional: basic hex validation
                            if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) {
                              field.onChange(val);
                              saveField();
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ===== Social Media URLs ===== */}
          <AccordionItem value="social">
            <AccordionTrigger>Social Media URLs</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  "facebook",
                  "instagram",
                  "twitter",
                  "facebookGroup",
                  "youtube",
                ] as const
              ).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={
                            typeof field.value === "string" ? field.value : ""
                          }
                          type="url"
                          onBlur={saveField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ===== Policies ===== */}
          <AccordionItem value="policies">
            <AccordionTrigger>Policies</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {(
                ["returnPolicy", "termsOfService", "privacyPolicy"] as const
              ).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={(val) => {
                            field.onChange(val);
                            saveField();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ===== Hero Section ===== */}
          <AccordionItem value="hero">
            <AccordionTrigger>Hero Section</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {(["title", "description", "image"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`hero.${key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>
                      <FormControl>
                        {key === "description" ? (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={(val) => {
                              field.onChange(val);
                              saveField();
                            }}
                          />
                        ) : key === "image" ? (
                          <FileUploader
                            imageUrl={field.value || ""}
                            onFieldChange={async (_blobUrl, files) => {
                              if (files?.length) {
                                const uploaded = await startUpload(files);
                                if (uploaded?.[0]) {
                                  form.setValue(
                                    `hero.${key}`,
                                    uploaded[0].url,
                                    {
                                      shouldValidate: true,
                                    },
                                  );
                                  saveField();
                                }
                              }
                            }}
                            setFiles={() => {}}
                          />
                        ) : (
                          <Input {...field} onBlur={saveField} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {(["offerStartDate", "offerEndDate"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`hero.${key}`}
                  render={({ field }) => {
                    // Convert string to yyyy-MM-dd format for date input
                    const dateValue =
                      field.value && !isNaN(Date.parse(field.value))
                        ? new Date(field.value).toISOString().split("T")[0]
                        : "";

                    return (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={dateValue}
                            onChange={(e) => field.onChange(e.target.value)} // Keep string
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ===== Popup Section ===== */}
          <AccordionItem value="popup">
            <AccordionTrigger>Popup Section</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {(["image"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`popup.${key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>
                      <FormControl>
                        <FileUploader
                          imageUrl={field.value || ""}
                          onFieldChange={async (_blobUrl, files) => {
                            if (files?.length) {
                              const uploaded = await startUpload(files);
                              if (uploaded?.[0]) {
                                form.setValue(`popup.${key}`, uploaded[0].url, {
                                  shouldValidate: true,
                                });
                                saveField();
                              }
                            }
                          }}
                          setFiles={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {(["offerStartDate", "offerEndDate"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`popup.${key}`}
                  render={({ field }) => {
                    // Convert string to yyyy-MM-dd format for date input
                    const dateValue =
                      field.value && !isNaN(Date.parse(field.value))
                        ? new Date(field.value).toISOString().split("T")[0]
                        : "";

                    return (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={dateValue}
                            onChange={(e) => field.onChange(e.target.value)} // Keep string
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ===== Features Section ===== */}
          <AccordionItem value="features">
            <AccordionTrigger>Features</AccordionTrigger>

            <AccordionContent className="space-y-4">
              {/* Section Header */}
              {(["badge", "title", "description"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`features.${key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key}</FormLabel>

                      <FormControl>
                        {key === "description" ? (
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={(val) => {
                              field.onChange(val);
                              saveField();
                            }}
                          />
                        ) : (
                          <Input {...field} onBlur={saveField} />
                        )}
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Feature Items */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Feature Items</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureFields.map((feature, index) => (
                    <div
                      key={feature.id}
                      className="border p-4 rounded space-y-4 bg-gray-50"
                    >
                      {/* Title */}
                      <FormField
                        control={form.control}
                        name={`features.items.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Feature Title"
                                value={field.value ?? ""}
                                onBlur={saveField}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name={`features.items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Feature Description"
                                value={field.value ?? ""}
                                onBlur={saveField}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Icon */}
                      <FormField
                        control={form.control}
                        name={`features.items.${index}.icon`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Icon name (lucide)"
                                value={field.value ?? ""}
                                onBlur={saveField}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <button
                        type="button"
                        onClick={async () => {
                          removeFeature(index);
                          await saveField();
                        }}
                        className="btn btn-sm text-red-500"
                      >
                        Remove Feature
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    appendFeature({
                      title: "",
                      description: "",
                      icon: "",
                    });
                    await saveField();
                  }}
                  className="btn btn-sm text-green-600"
                >
                  Add Feature
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ===== Testimonials ===== */}
          <AccordionItem value="testimonials">
            <AccordionTrigger>Testimonials</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded space-y-2">
                {/* Badge, Title, Description */}
                {["badge", "title", "description"].map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`testimonials.${key}` as keyof SettingFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          {key === "description" ? (
                            <RichTextEditor
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                              onChange={(val) => {
                                field.onChange(val);
                                saveField();
                              }}
                            />
                          ) : (
                            <Input
                              {...field}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                              onBlur={saveField}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* totalEnrollment, totalSucceededStudents, totalIndustryExperts */}
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="testimonials.totalEnrollment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Enrollments</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testimonials.totalSucceededStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Succeeded Students</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testimonials.totalIndustryExperts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Industry Experts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Feedbacks */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Feedbacks</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackFields.map((feedback, fIndex) => (
                      <div
                        key={feedback.id}
                        className="border p-4 rounded space-y-4 bg-gray-50"
                      >
                        {/* Photo */}
                        <FormField
                          control={form.control}
                          name={`testimonials.feedbacks.${fIndex}.photo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Photo</FormLabel>
                              <FormControl>
                                <FileUploader
                                  imageUrl={field.value || ""}
                                  onFieldChange={async (_blobUrl, files) => {
                                    if (files?.length) {
                                      const uploaded = await startUpload(files);
                                      if (uploaded?.[0]) {
                                        form.setValue(
                                          `testimonials.feedbacks.${fIndex}.photo`,
                                          uploaded[0].url,
                                          { shouldValidate: true },
                                        );
                                        await saveField();
                                      }
                                    }
                                  }}
                                  setFiles={() => {}}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 gap-4">
                          {/* Name */}
                          <FormField
                            control={form.control}
                            name={`testimonials.feedbacks.${fIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Customer Name"
                                    value={field.value ?? ""}
                                    onBlur={saveField}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Rating FIXED */}
                          <FormField
                            control={form.control}
                            name={`testimonials.feedbacks.${fIndex}.rating`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Rating"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value === ""
                                          ? undefined
                                          : Number(e.target.value),
                                      )
                                    }
                                    onBlur={saveField}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Comment */}
                          <FormField
                            control={form.control}
                            name={`testimonials.feedbacks.${fIndex}.comment`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Customer feedback"
                                    value={field.value ?? ""}
                                    onBlur={saveField}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            removeFeedback(fIndex);
                            await saveField();
                          }}
                          className="btn btn-sm text-red-500"
                        >
                          Remove Feedback
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      appendFeedback({
                        name: "",
                        photo: "",
                        rating: 0,
                        comment: "",
                      });
                      await saveField();
                    }}
                    className="btn btn-sm text-green-600"
                  >
                    Add Feedback
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ===== Our Mentors ===== */}
          <AccordionItem value="ourMentors">
            <AccordionTrigger>Our Mentors</AccordionTrigger>

            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded space-y-4">
                {/* Badge / Title / Description */}
                {["badge", "title", "description"].map((key) => {
                  const fieldName =
                    `ourMentors.${key}` as Path<SettingFormValues>;

                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{key}</FormLabel>

                          <FormControl>
                            {key === "description" ? (
                              <RichTextEditor
                                value={
                                  typeof field.value === "string"
                                    ? field.value
                                    : ""
                                }
                                onChange={(val) => {
                                  field.onChange(val);
                                  saveField();
                                }}
                              />
                            ) : (
                              <Input
                                {...field}
                                value={
                                  typeof field.value === "string"
                                    ? field.value
                                    : ""
                                }
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={saveField}
                              />
                            )}
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}

                {/* Mentors */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Mentors</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentorFields.map((mentor, mIndex) => (
                      <div
                        key={mentor.id}
                        className="border p-4 rounded space-y-4 bg-gray-50"
                      >
                        {/* Photo */}
                        <FormField
                          control={form.control}
                          name={`ourMentors.mentors.${mIndex}.photo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Photo</FormLabel>
                              <FormControl>
                                <FileUploader
                                  imageUrl={field.value || ""}
                                  onFieldChange={async (_blobUrl, files) => {
                                    if (files?.length) {
                                      const uploaded = await startUpload(files);
                                      if (uploaded?.[0]) {
                                        form.setValue(
                                          `ourMentors.mentors.${mIndex}.photo`,
                                          uploaded[0].url,
                                          { shouldValidate: true },
                                        );
                                        await saveField();
                                      }
                                    }
                                  }}
                                  setFiles={() => {}}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Name */}
                        <FormField
                          control={form.control}
                          name={
                            `ourMentors.mentors.${mIndex}.name` as Path<SettingFormValues>
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>

                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Mentor Name"
                                  value={
                                    typeof field.value === "string"
                                      ? field.value
                                      : ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={saveField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Expertise */}
                        <FormField
                          control={form.control}
                          name={
                            `ourMentors.mentors.${mIndex}.expertise` as Path<SettingFormValues>
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expertise</FormLabel>

                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Mentor Expertise"
                                  value={
                                    typeof field.value === "string"
                                      ? field.value
                                      : ""
                                  }
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={saveField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Social Links */}
                        {["facebook", "linkedIn", "twitter", "other"].map(
                          (social) => {
                            const name =
                              `ourMentors.mentors.${mIndex}.social.${social}` as Path<SettingFormValues>;

                            return (
                              <FormField
                                key={social}
                                control={form.control}
                                name={name}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="capitalize">
                                      {social}
                                    </FormLabel>

                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder={`${social} URL`}
                                        value={
                                          typeof field.value === "string"
                                            ? field.value
                                            : ""
                                        }
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        onBlur={saveField}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            );
                          },
                        )}

                        {/* Remove Mentor */}
                        <button
                          type="button"
                          onClick={async () => {
                            removeMentor(mIndex);
                            await saveField();
                          }}
                          className="btn btn-sm text-red-500"
                        >
                          Remove Mentor
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Mentor */}
                  <button
                    type="button"
                    onClick={() =>
                      appendMentor({
                        name: "",
                        photo: "",
                        expertise: "",
                        social: {
                          facebook: "",
                          linkedIn: "",
                          twitter: "",
                          other: "",
                        },
                      })
                    }
                    className="btn btn-sm text-green-600"
                  >
                    Add Mentor
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ===== Partners ===== */}
          <AccordionItem value="partners">
            <AccordionTrigger>Partners</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded space-y-2">
                {/* Badge, Title, Description */}
                {["badge", "title", "description"].map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`partners.${key}` as keyof SettingFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          {key === "description" ? (
                            <RichTextEditor
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                              onChange={(val) => {
                                field.onChange(val);
                                saveField();
                              }}
                            />
                          ) : (
                            <Input
                              {...field}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                              onBlur={saveField}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* Logos */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Logos</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {logoFields.map((logo, fIndex) => (
                      <div
                        key={logo.id}
                        className="border p-4 rounded space-y-4 bg-gray-50"
                      >
                        {/* Photo */}
                        <FormField
                          control={form.control}
                          name={`partners.logos.${fIndex}.photo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Photo</FormLabel>
                              <FormControl>
                                <FileUploader
                                  imageUrl={field.value || ""}
                                  onFieldChange={async (_blobUrl, files) => {
                                    if (files?.length) {
                                      const uploaded = await startUpload(files);
                                      if (uploaded?.[0]) {
                                        form.setValue(
                                          `partners.logos.${fIndex}.photo`,
                                          uploaded[0].url,
                                          { shouldValidate: true },
                                        );
                                        await saveField();
                                      }
                                    }
                                  }}
                                  setFiles={() => {}}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 gap-4">
                          {/* Name */}
                          <FormField
                            control={form.control}
                            name={`partners.logos.${fIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Company Name"
                                    value={field.value ?? ""}
                                    onBlur={saveField}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            removeLogo(fIndex);
                            await saveField();
                          }}
                          className="btn btn-sm text-red-500"
                        >
                          Remove Logo
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      appendLogo({
                        name: "",
                        photo: "",
                      });
                      await saveField();
                    }}
                    className="btn btn-sm text-green-600"
                  >
                    Add Logo
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ===== FAQs ===== */}
          <AccordionItem value="faqs">
            <AccordionTrigger>FAQs</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="border p-4 rounded space-y-2">
                {/* Badge, Title, Description */}
                {(["badge", "title", "description"] as const).map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`faqs.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input {...field} onBlur={saveField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* FAQ Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold">FAQ Items</h4>
                  {itemFields.map((item, iIndex) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`faqs.items.${iIndex}.question`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Question"
                            onBlur={saveField}
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`faqs.items.${iIndex}.answer`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Answer"
                            onBlur={saveField}
                          />
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(iIndex)}
                        className="btn btn-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendItem({ question: "", answer: "" })}
                    className="btn btn-sm"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
