"use client";

type Common = {
  children: React.ReactNode;
  variant?: "dark" | "light" | "ghost-light";
  block?: boolean;
  cursor?: string;
  className?: string;
};

type AsButton = Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function ArrowButton(props: AsButton | AsLink) {
  const { children, variant = "dark", block, cursor = "join", className = "", ...rest } = props;
  const cls = [
    "btn",
    variant === "light" && "btn--light",
    variant === "ghost-light" && "btn--ghost-light",
    block && "btn--block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className="btn__label">{children}</span>
      <span className="btn__arrow" aria-hidden="true">
        →
      </span>
    </>
  );

  if ("href" in rest && rest.href) {
    return (
      <a className={cls} data-cursor={cursor} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} data-cursor={cursor} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
