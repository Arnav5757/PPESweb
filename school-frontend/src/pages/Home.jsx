import React, { useState, useEffect } from "react";
import PublicLayout from "../layouts/PublicLayout";
import Hero from "../components/Hero/Hero";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import VisionMission from "../components/VisionMission/VisionMission";
import InfoSection from "../components/InfoSection/InfoSection";
import Highlights from "../components/Highlights/Highlights";
import Curriculum from "../components/Curriculum/Curriculum";
import Faculty from "../components/Faculty/Faculty";
import Toppers from "../components/Toppers/Toppers";
import AdmissionsInfo from "../components/AdmissionsInfo/AdmissionsInfo";
import Gallery from "../components/Gallery/Gallery";
import { request } from "../services/api";

export const Home = () => {
  const [cms, setCms] = useState({});

  useEffect(() => {
    request("/api/cms")
      .then((data) => {
        if (data.success && data.cms) {
          setCms(data.cms);
        }
      })
      .catch((err) => console.error("Error loading CMS details:", err));
  }, []);

  return (
    <PublicLayout contact={cms.contact}>
      <Hero cms={cms.hero} />
      <WhyChooseUs cms={cms.why} />
      <div className="space-y-20 select-none">
        <VisionMission cms={cms.vision_mission} />
        <Highlights />
        <InfoSection cmsDirector={cms.director} />
        <Curriculum cms={cms.curriculum} />
        <Faculty />
        <Toppers />
        <AdmissionsInfo cms={cms.admissions} />
        <Gallery />
      </div>
    </PublicLayout>
  );
};

export default Home;
