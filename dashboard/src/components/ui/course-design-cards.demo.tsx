import React from "react";
import Card from "@/components/ui/course-design-cards";

/**
 * Demo for course-design-cards.
 * Note: global styles live in app/globals.css (imported by the root layout),
 * so the original `import '@/index.css'` is not needed in this Next.js setup.
 */
const DefaultDemo: React.FC = () => {
  const cardData = [
    {
      id: 1,
      colorClass: "green",
      date: "Feb 2, 2021",
      title: "web designing",
      description: "Prototyping",
      progressPercent: "90%",
      progressValue: "90%",
      imgSrc1:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80",
      imgAlt1: "User 1",
      imgSrc2:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      imgAlt2: "User 2",
      countdownText: "2 days left",
    },
    {
      id: 2,
      colorClass: "orange",
      date: "Feb 05, 2021",
      title: "mobile app",
      description: "Shopping",
      progressPercent: "30%",
      progressValue: "30%",
      imgSrc1:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      imgAlt1: "User 3",
      imgSrc2:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
      imgAlt2: "User 4",
      countdownText: "3 weeks left",
    },
    {
      id: 3,
      colorClass: "red",
      date: "March 03, 2021",
      title: "dashboard",
      description: "Medical",
      progressPercent: "50%",
      progressValue: "50%",
      imgSrc1:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80",
      imgAlt1: "User 5",
      imgSrc2:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80",
      imgAlt2: "User 6",
      countdownText: "3 weeks left",
    },
    {
      id: 4,
      colorClass: "blue",
      date: "March 08, 2021",
      title: "web designing",
      description: "Wireframing",
      progressPercent: "20%",
      progressValue: "20%",
      imgSrc1:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
      imgAlt1: "Erik Longman",
      imgSrc2:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      imgAlt2: "Jane Doe",
      countdownText: "3 weeks left",
    },
  ];

  return (
    <section className="course-cards">
      {cardData.map((card) => (
        <Card key={card.id} data={card} />
      ))}
    </section>
  );
};

export default DefaultDemo;
