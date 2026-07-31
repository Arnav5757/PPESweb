import { motion } from "framer-motion";
import { BookOpenCheck, HeartHandshake, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Card } from "../ui/Card";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";

const features = [
  {
    title: "Academic Excellence",
    description:
      "Structured classroom learning, experienced teachers, and steady academic guidance help students build strong foundations.",
    icon: BookOpenCheck
  },
  {
    title: "Holistic Development",
    description:
      "Sports, cultural activities, leadership moments, and personal development are encouraged alongside academics.",
    icon: HeartHandshake
  },
  {
    title: "Modern Learning",
    description:
      "Technology-supported classrooms and interactive teaching methods make learning clearer, practical, and engaging.",
    icon: MonitorSmartphone
  },
  {
    title: "Safe & Supportive Campus",
    description:
      "A disciplined, inclusive, and caring environment helps every child learn with confidence and respect.",
    icon: ShieldCheck
  }
];

const sectionMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={cardMotion}
      transition={{ duration: 0.38, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="h-full"
    >
      <Card
        hoverLift={false}
        tabIndex={0}
        className="group h-full rounded-2xl border-slate-200 p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] outline-none ring-slate-900/10 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_22px_55px_rgba(15,23,42,0.08)] focus-visible:ring-2"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-colors duration-300 group-hover:bg-white">
          <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-lg font-bold leading-tight text-slate-950 font-display">
          {feature.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {feature.description}
        </p>
      </Card>
    </motion.div>
  );
};

const WhyChooseUs = ({ cms }) => {
  const badge = cms?.badge || "Why Choose Us";
  const title = cms?.title || "Why choose Pareek Public English School?";
  const description = cms?.description || "Parents look for a school that is academically sincere, emotionally supportive, and consistent in everyday discipline. Our approach keeps learning focused, balanced, and grounded in values.";

  return (
    <Section
      id="why-choose-us"
      background="gray"
      className="border-y border-slate-200/70 py-20 md:py-24"
      aria-labelledby="why-choose-us-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm"
          >
            {badge}
          </motion.div>

          <motion.h2
            id="why-choose-us-heading"
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="mt-5 text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl lg:text-5xl font-display"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={sectionMotion}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
            className="mt-5 text-base leading-8 text-slate-600"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default WhyChooseUs;
