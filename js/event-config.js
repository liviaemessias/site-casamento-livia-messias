(function () {
  const defaults = {
    bride_name: "Livia",
    groom_name: "Messias",
    wedding_date: "2027-04-23T18:30:00-03:00",
    rsvp_deadline: "2027-03-01",
    ceremony_name: "Santuário de Nossa Senhora de Fátima",
    ceremony_address:
      "Av. Treze de Maio, 200 - Fátima, Fortaleza - CE, 60040-530",
    ceremony_time: "18:30",
    reception_name: "Martha's Buffet Conceito",
    reception_address:
      "Av. Bezerra de Menezes, 531 - Parquelândia, Fortaleza - CE, 60325-004",
    reception_time: "21:00",
    site_url:
      "https://liviaemessias.github.io/site-casamento-livia-messias/",
    social_image:
      "https://liviaemessias.github.io/site-casamento-livia-messias/assets/images/home/cover-main-page.jpg",
    site_description_template:
      "Celebre conosco o nosso casamento • {date}. Confira os detalhes do grande dia!",
  };

  function getDefaults() {
    return { ...defaults };
  }

  window.WeddingEventConfig = {
    defaults,
    getDefaults,
  };
})();
