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

// ================= Zod Schema =================
export const settingSchema = z.object({
  logo: z.string().optional(),
  favicon: z.string().optional(),
  name: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  theme: z.string().optional(),

  deliveryCharge: z
    .object({
      insideDhaka: z.string().optional(),
      outSideDhaka: z.string().optional(),
      PickupPoint: z.string().optional(),
    })
    .optional(),

  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebookGroup: z.string().url().optional(),
  youtube: z.string().url().optional(),

  returnPolicy: z.string().optional(),
  termsOfService: z.string().optional(),
  privacyPolicy: z.string().optional(),

  hero: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      offerStartDate: z.coerce.date().optional(),
      offerEndDate: z.coerce.date().optional(),
    })
    .optional(),

  features: z
    .object({
      badge: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      weGiveYou: z.array(z.string()).default([]),
      weDoNotGiveYou: z.array(z.string()).default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      image: "",
      weGiveYou: [],
      weDoNotGiveYou: [],
    }),

  howToIdentify: z
    .object({
      badge: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      features: z.array(z.string()).default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      image: "",
      features: [],
    }),

  testimonials: z
    .object({
      badge: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      totalCustomers: z.number().default(0),
      totalDistricts: z.number().default(0),
      totalReOrders: z.number().default(0),
      feedbacks: z
        .array(
          z.object({
            name: z.string().optional(),
            photo: z.string().optional(),
            rating: z.number().optional(),
            comment: z.string().optional(),
          }),
        )
        .default([]),
    })
    .default({
      badge: "",
      title: "",
      description: "",
      totalCustomers: 0,
      totalDistricts: 0,
      totalReOrders: 0,
      feedbacks: [],
    }),

  faqs: z
    .object({
      badge: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      items: z
        .array(
          z.object({
            question: z.string().optional(),
            answer: z.string().optional(),
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

  // Testimonials.feedbacks array
  const {
    fields: feedbackFields,
    append: appendFeedback,
    remove: removeFeedback,
  } = useFieldArray({
    control: form.control,
    name: "testimonials.feedbacks",
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

          {/* ===== Delivery Charges ===== */}
          <AccordionItem value="delivery">
            <AccordionTrigger>Delivery Charge</AccordionTrigger>
            <AccordionContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["insideDhaka", "outSideDhaka", "PickupPoint"] as const).map(
                (key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`deliveryCharge.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={
                              typeof field.value === "string" ? field.value : ""
                            }
                            onBlur={saveField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ),
              )}
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

              {/* Hero Dates */}
              {(["offerStartDate", "offerEndDate"] as const).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={`hero.${key}`}
                  render={({ field }) => {
                    const valueStr = field.value
                      ? field.value.toISOString().split("T")[0]
                      : "";
                    return (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={valueStr}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined,
                              )
                            }
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
              {(["badge", "title", "description", "image"] as const).map(
                (key) => (
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
                          ) : key === "image" ? (
                            <FileUploader
                              imageUrl={field.value || ""}
                              onFieldChange={async (_blobUrl, files) => {
                                if (files?.length) {
                                  const uploaded = await startUpload(files);
                                  if (uploaded?.[0]) {
                                    form.setValue(
                                      `features.${key}`,
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
                ),
              )}

              {/* We Give You & We Do Not Give You */}
              {[
                { title: "We Give You", name: "features.weGiveYou" },
                {
                  title: "We Do Not Give You",
                  name: "features.weDoNotGiveYou",
                },
              ].map((section) => {
                const values = (form.watch(
                  section.name as Path<SettingFormValues>,
                ) ?? []) as string[];
                return (
                  <div key={section.title} className="space-y-2">
                    <h4 className="font-semibold">{section.title}</h4>
                    {values.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const current = (form.getValues(
                              section.name as Path<SettingFormValues>,
                            ) ?? []) as string[];
                            const updated = [...current];
                            updated[index] = e.target.value;
                            form.setValue(
                              section.name as Path<SettingFormValues>,
                              updated,
                            );
                          }}
                          onBlur={saveField}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = (form.getValues(
                              section.name as Path<SettingFormValues>,
                            ) ?? []) as string[];
                            const updated = current.filter(
                              (_, i) => i !== index,
                            );
                            form.setValue(
                              section.name as Path<SettingFormValues>,
                              updated,
                            );
                            saveField();
                          }}
                          className="btn btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const current = (form.getValues(
                          section.name as Path<SettingFormValues>,
                        ) ?? []) as string[];
                        form.setValue(section.name as Path<SettingFormValues>, [
                          ...current,
                          "",
                        ]);
                        saveField();
                      }}
                      className="btn btn-sm"
                    >
                      Add Item
                    </button>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>

          {/* ===== How to Identify ===== */}
          <AccordionItem value="identify">
            <AccordionTrigger>How to Identify</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {(["badge", "title", "description", "image"] as const).map(
                (key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`howToIdentify.${key}`}
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
                                      `howToIdentify.${key}`,
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
                ),
              )}

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-semibold">Features</h4>
                {form.watch("howToIdentify.features").map((feature, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        form.setValue(
                          `howToIdentify.features.${index}`,
                          e.target.value,
                        )
                      }
                      onBlur={saveField}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = form.getValues(
                          "howToIdentify.features",
                        );
                        form.setValue(
                          "howToIdentify.features",
                          current.filter((_, i) => i !== index),
                        );
                        saveField();
                      }}
                      className="btn btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const current = form.getValues("howToIdentify.features");
                    form.setValue("howToIdentify.features", [...current, ""]);
                    saveField();
                  }}
                  className="btn btn-sm"
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

                {/* totalCustomers, totalDistricts, totalReOrders */}
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="testimonials.totalCustomers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Customers</FormLabel>
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
                    name="testimonials.totalDistricts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Districts</FormLabel>
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
                    name="testimonials.totalReOrders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total ReOrders</FormLabel>
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

                      <div className="grid md:grid-cols-3 gap-4">
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
