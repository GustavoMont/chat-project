import React, { PropsWithChildren } from "react";

interface Props {
  title: string;
  active: boolean;
}

export const Modal: React.FC<PropsWithChildren<Props>> = ({
  title,
  active,
  children,
}) => {
  return (
    <dialog className={`modal ${active ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg text-center text-slate-800">
          {title}
        </h3>
        {children}
      </div>
    </dialog>
  );
};
