import React, { useState } from "react";
import "./Counter.css";

export default function Counter({
  children,
  count: initialCount,
}: {
  children: JSX.Element;
  count: number;
}) {
  const [count, setCount] = useState(initialCount);
  const add = () => setCount((i) => i + 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const subtract = () => setCount((i) => i - 1);

  return (
    <>
      <div className="counter">
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div className="counter-message">{children}</div>
    </>
  );
}