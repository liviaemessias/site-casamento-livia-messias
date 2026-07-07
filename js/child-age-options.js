(function () {
  function getStandardAges() {
    const ages = ["Menos de 1 mês"];

    for (let month = 1; month <= 11; month += 1) {
      ages.push(`${month} ${month === 1 ? "mês" : "meses"}`);
    }

    for (let year = 1; year <= 17; year += 1) {
      ages.push(`${year} ${year === 1 ? "ano" : "anos"}`);
    }

    return ages;
  }

  function populateSelect(select, selectedValue = "") {
    const normalizedValue = String(selectedValue || "").trim();
    const standardAges = getStandardAges();
    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Selecione a idade no casamento";
    select.replaceChildren(placeholder);

    if (normalizedValue && !standardAges.includes(normalizedValue)) {
      const currentOption = document.createElement("option");
      currentOption.value = normalizedValue;
      currentOption.textContent = `Valor atual: ${normalizedValue}`;
      currentOption.selected = true;
      select.appendChild(currentOption);
    }

    standardAges.forEach((age) => {
      const option = document.createElement("option");
      option.value = age;
      option.textContent = age;
      option.selected = age === normalizedValue;
      select.appendChild(option);
    });
  }

  window.ChildAgeOptions = {
    populateSelect,
  };
})();
