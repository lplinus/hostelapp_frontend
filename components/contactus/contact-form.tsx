"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendContactMessage } from "@/services/public.service";
import type { ContactMessagePayload } from "@/types/public.types";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactMessagePayload>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("loading");
    setErrorMessage("");

    try {
      await sendContactMessage(formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              Send Us a Message
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  className={cn(
                    "rounded-xl",
                    errors.name ? "border-red-500 focus:ring-red-500" : formData.name.trim().length >= 3 ? "border-green-500 focus:ring-green-500" : ""
                  )}
                />
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <Input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  }}
                  className={cn(
                    "rounded-xl",
                    errors.email ? "border-red-500 focus:ring-red-500" : (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ? "border-green-500 focus:ring-green-500" : ""
                  )}
                />
                {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                  }}
                  className={cn(
                    "rounded-xl",
                    errors.message ? "border-red-500 focus:ring-red-500" : formData.message.trim().length >= 10 ? "border-green-500 focus:ring-green-500" : ""
                  )}
                />
                {errors.message && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.message}</p>}
              </div>

              {status === "success" && (
                <p className="text-green-600 text-sm font-medium">
                  ✅ Message sent successfully! We'll get back to you soon.
                </p>
              )}

              {status === "error" && (
                <p className="text-red-600 text-sm font-medium">
                  ❌ {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-lg"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}