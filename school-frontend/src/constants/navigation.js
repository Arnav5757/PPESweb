import { SECTIONS } from "./sections";

export const navigationConfig = [
  {
    title: "Home",
    type: "section",
    section: SECTIONS.HOME
  },
  {
    title: "About Us",
    type: "dropdown",
    children: [
      { label: "About School", type: "section", section: SECTIONS.WHY_CHOOSE_US },
      { label: "Director's Message", type: "section", section: SECTIONS.DIRECTOR_MESSAGE },
      { label: "Vision & Mission", type: "section", section: SECTIONS.VISION_MISSION }
    ]
  },
  {
    title: "Academics",
    type: "dropdown",
    children: [
      { label: "Curriculum", type: "section", section: SECTIONS.CURRICULUM },
      { label: "Faculty", type: "section", section: SECTIONS.FACULTY },
      { label: "Academic Calendar", type: "section", section: SECTIONS.NOTICES }
    ]
  },
  {
    title: "Admissions",
    type: "dropdown",
    children: [
      { label: "Admission Process", type: "section", section: SECTIONS.ADMISSIONS },
      { label: "Online Admission", type: "section", section: SECTIONS.HOME },
      { label: "Required Documents", type: "section", section: SECTIONS.ADMISSIONS },
      { label: "FAQ", type: "section", section: SECTIONS.ADMISSIONS }
    ]
  },
  {
    title: "Student Life",
    type: "dropdown",
    children: [
      { label: "Sports", type: "section", section: SECTIONS.GALLERY },
      { label: "Events", type: "section", section: SECTIONS.NOTICES },
      { label: "Gallery", type: "route", route: "/gallery" }
    ]
  },
  {
    title: "Gallery",
    type: "route",
    route: "/gallery"
  },
  {
    title: "Contact",
    type: "section",
    section: SECTIONS.CONTACT
  }
];

export const NAVBAR_SCROLL_THRESHOLD = 20;
