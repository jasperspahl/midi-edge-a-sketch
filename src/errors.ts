import classes from "./errors.module.css";

const errorsContainer = document.getElementById("errors") as HTMLDivElement;

export const error = (template: TemplateStringsArray, ...args: any[]) => {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add(classes.error);

  errorDiv.innerHTML = `
		<div>${String.raw(template, ...args)}</div>
		<button class="${classes.close}">X</button>`;
  errorDiv.children[1]
    .addEventListener("click", () => {
      errorDiv.remove();
    });

  errorsContainer.appendChild(errorDiv);
  console.error(String.raw(template, ...args), ...args);
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
};

export const info = (template: TemplateStringsArray, ...args: any[]) => {
  const infoDiv = document.createElement("div");
  infoDiv.classList.add(classes.info);

  infoDiv.innerHTML = `
		<div>${String.raw(template, ...args)}</div>
		<button class="${classes.close}">X</button>`;
  infoDiv.children[1]
    .addEventListener("click", () => {
      infoDiv.remove();
    });

  errorsContainer.appendChild(infoDiv);
  console.info(String.raw(template, ...args), ...args);
  setTimeout(() => {
    infoDiv.remove();
  }, 2000);
}
