export function animateNotif(text: string, element: HTMLElement) {
  let previousNotification = document.querySelector('[data-notification-set="true"]');
  if (previousNotification) {
    (previousNotification as HTMLElement).style.display = "none";
    previousNotification.removeAttribute("data-notification-set");
  }

  element.setAttribute("data-notification-set", "true");
  element.style.display = "flex";
  element.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 500,
    easing: "ease-in-out",
    fill: "forwards",
  });
  element.querySelector("h1")!.textContent = text;

  setTimeout(() => {
    element.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 500,
      easing: "ease-in-out",
      iterations: 1,
      fill: "forwards",
    });
    setTimeout(() => {
      element.style.display = "none";
    }, 500);
  }, 4 * 1000);
}
