import React, { useMemo, useState } from "react";
import TabItem from "./TabItem";

type TabContextProps = {
  active: string;
  addTabItem: (title: string, key: string) => void;
};

const TabContext = React.createContext<TabContextProps>({
  active: "",
  addTabItem: () => {},
});

type Props = {
  children: React.ReactElement;
  defaultActiveKey: string;
};

const Tab: React.FC<Props> = ({ defaultActiveKey, children }) => {
  const [active, setActive] = useState<string>(defaultActiveKey);
  const items = useMemo(() => {
    const elements = React.Children.toArray(children);

    return elements.filter((w) => {
      if (React.isValidElement(w)) {
        return String(w.type) === String(TabItem);
      }
      return false;
    }) as { props: React.ComponentProps<typeof TabItem> }[];
  }, [children]);

  const activeItem = items.find(
    (w) => w.props.tabKey === active
  ) as React.ReactElement;

  return (
    <div>
      <ul className="relative flex flex-row gap-x-4 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b-2 before:border-gray-300">
        {items.map((w) => {
          const isActive = w.props.tabKey === active;
          const cls: string[] = ["relative px-4 py-2 cursor-pointer"];

          if (isActive)
            cls.push(
              "before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b-2 before:border-sky-500"
            );

          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
            <li
              key={w.props.tabKey}
              className={cls.join(" ")}
              onClick={() => setActive(w.props.tabKey)}
            >
              {w.props.title}
            </li>
          );
        })}
      </ul>
      <div className="mt-4">{activeItem}</div>
    </div>
  );
};

export default Tab;
export { TabContext };
