(function () {
  const UNDER_ONE_YEAR_LABEL = "Menos de 1 ano";

  function getStandardAges() {
    const ages = [UNDER_ONE_YEAR_LABEL];

    for (let year = 1; year <= 12; year += 1) {
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
