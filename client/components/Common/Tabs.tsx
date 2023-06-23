import { useState } from "react";

interface Tab {
  title: string;
  content: React.ReactNode;
}

interface Props {
  tabs: Tab[];
}

const Tabs = ({ tabs }: Props) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="-mb-px flex">
          {tabs.map((tab, index) => (
            <a
              key={index}
              className={`whitespace-nowrap cursor-pointer py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === index
                  ? "text-gray-500 hover:text-gray-700 border-gray-300"
                  : "text-gray-700 hover:text-gray-500 border-transparent"
              }`}
              onClick={() => handleTabClick(index)}
            >
              {tab.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.map((tab, index) => (
          <div
            key={index}
            style={{ display: activeTab === index ? "block" : "none" }}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
