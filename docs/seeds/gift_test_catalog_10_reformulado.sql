-- Seed de testes: Lista de Presentes
-- Projeto: Site Casamento Lívia & Messias
-- Quantidade: 10 presentes
-- Itens não-quota: purchase_mode = 'hybrid'
-- Itens por cota: gift_type = 'quota' e purchase_mode = 'money'
-- Itens personalizáveis: a personalização é indicada somente na descrição.

begin;

insert into public.gifts (
  id, category, name, description, price, image_url, status,
  payment_status, card_payment_url, card_payment_provider, card_payment_reference,
  purchase_mode, external_purchase_options, selected_purchase_method,
  selected_purchase_details, gift_type, quota_count, quota_value
)
values
(
'f2000000-0000-4000-8000-000000000001','Lua de Mel','Hospedagem romântica em Gramado',
'Uma contribuição para a nossa hospedagem durante a lua de mel em Gramado.',
900.00,
'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
'Disponível',null,null,null,null,'money','[]'::jsonb,null,null,'quota',18,50.00
),
(
'f2000000-0000-4000-8000-000000000002','Lua de Mel','Jantar romântico em Gramado',
'Uma contribuição para celebrarmos os primeiros dias de casados com um jantar especial durante a nossa lua de mel.',
420.00,
'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
'Disponível',null,null,null,null,'money','[]'::jsonb,null,null,'quota',8,52.50
),
(
'f2000000-0000-4000-8000-000000000003','Lua de Mel','Passeio de Maria Fumaça',
'Uma contribuição para vivermos o passeio de Maria Fumaça pela Serra Gaúcha durante a nossa lua de mel.',
480.00,
'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
'Disponível',null,null,null,null,'money','[]'::jsonb,null,null,'quota',12,40.00
),
(
'f2000000-0000-4000-8000-000000000004','Noiva','Chocolates para a noiva',
'Uma contribuição para adoçar os preparativos e o grande dia da noiva.',
240.00,
'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80',
'Disponível',null,null,null,null,'money','[]'::jsonb,null,null,'quota',8,30.00
),
(
'f2000000-0000-4000-8000-000000000005','Casa Nova','Jogo de toalhas',
'Toalhas de banho e rosto para o nosso novo lar. Se você quiser personalizar o presente, recomendamos escolher a compra externa, online ou física, para definir cor, tamanho, monograma ou bordado. Sugestão: conjunto 100% algodão, 5 peças, cor branca ou off-white.',
189.90,
'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/jogo-toalhas','Link de teste','LM-GIFT-205',
'hybrid',
$$[
{"type":"online","store":"Mercado Livre","url":"https://lista.mercadolivre.com.br/toalha-banho-personalizada","notes":"Preferência: conjunto 5 peças, 100% algodão, cor branca ou off-white. Procurar opção com bordado ou monograma."},
{"type":"physical","store":"Shopping do Mercado","address":"Avenida Alberto Nepomuceno, 199, Loja 123, 1º piso, Mercado Central, Centro, Fortaleza - CE, 60055-000","notes":"Loja de cama, mesa e banho. Procurar conjunto de toalhas 100% algodão; personalização/bordado pode ser combinada no local."}
]$$::jsonb,null,null,'single',null,null
),
(
'f2000000-0000-4000-8000-000000000006','Casa Nova','Jogo de cama',
'Um jogo de cama para deixar o nosso quarto mais aconchegante. Para quem quiser personalizar o presente, recomendamos a compra externa, onde é possível escolher tamanho, tecido, cor, estampa ou bordado. Sugestão: casal/Queen, 4 peças, 200 fios ou superior, em tons claros.',
279.90,
'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/jogo-cama','Link de teste','LM-GIFT-206',
'hybrid',
$$[
{"type":"online","store":"Amazon Brasil","url":"https://www.amazon.com.br/s?k=jogo+de+cama+casal+queen+200+fios","notes":"Preferência: tamanho Queen, 4 peças, 200 fios ou superior, algodão, tons claros. Para personalização, escolher uma opção com bordado/monograma."},
{"type":"physical","store":"First Class Home Iguatemi Shopping","address":"Av. Washington Soares, 85, Loja 25, Edson Queiroz, Fortaleza - CE, 60811-341","notes":"Procurar jogo de cama Queen em algodão, 200 fios ou superior. Consultar possibilidade de personalização."}
]$$::jsonb,null,null,'single',null,null
),
(
'f2000000-0000-4000-8000-000000000007','Casa Nova','Colcha para cama',
'Uma colcha para o nosso quarto. Se o convidado desejar personalizar o presente, recomendamos a compra externa, online ou física, para escolher tamanho, tecido, cor, estampa, acabamento ou bordado. Sugestão: tamanho Queen, tecido matelassê ou algodão, em tons neutros.',
349.90,
'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/colcha-cama','Link de teste','LM-GIFT-207',
'hybrid',
$$[
{"type":"online","store":"Amazon Brasil","url":"https://www.amazon.com.br/s?k=colcha+queen+matelasse","notes":"Preferência: Queen, matelassê, tons neutros. Para personalização, selecionar uma opção que aceite bordado ou acabamento personalizado."},
{"type":"physical","store":"Fortaleza Enxovais","address":"Rua Senador Pompeu, 834, Centro, Fortaleza - CE, 60025-000","notes":"Procurar colcha Queen em tons neutros. Personalização pode ser combinada conforme disponibilidade."}
]$$::jsonb,null,null,'single',null,null
),
(
'f2000000-0000-4000-8000-000000000008','Casa Nova','Jogo de travesseiros',
'Para noites de descanso na casa nova. Como altura, firmeza e material são preferências pessoais, recomendamos a compra externa, online ou física. Se desejar personalizar o presente, a compra externa também permite escolher modelo, acabamento ou eventual bordado.',
189.90,
'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/jogo-travesseiros','Link de teste','LM-GIFT-208',
'hybrid',
$$[
{"type":"online","store":"Mercado Livre","url":"https://www.mercadolivre.com.br/","notes":"Preferência: kit com 2 travesseiros, tamanho padrão/casal, espuma viscoelástica ou perfil alto. Confirmar modelo e firmeza antes da compra."},
{"type":"physical","store":"O REI DA TOALHA - Cama, Mesa e Banho","address":"Rua Conde D'eu, 490, salas 1, 2 e 3, Centro, Fortaleza - CE, 60055-070","notes":"Escolher presencialmente o modelo e a firmeza dos travesseiros. Consultar opções de personalização."}
]$$::jsonb,null,null,'single',null,null
),
(
'f2000000-0000-4000-8000-000000000009','Eletrodomésticos','Air Fryer',
'Para receitas práticas no nosso dia a dia. Sugestão: Britânia BAF45A, 5 litros, 1500W, revestimento Antiaderente Gold, controle de temperatura de 80°C a 200°C. Atenção à voltagem: escolher 127V ou 220V de acordo com a instalação da nossa casa.',
279.90,
'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/air-fryer','Link de teste','LM-GIFT-209',
'hybrid',
$$[
{"type":"online","store":"Britânia - Loja Oficial","url":"https://www.britania.com.br/fritadeira-air-fryer-baf45a-127v-063801122/p","notes":"Modelo BAF45A. Capacidade 5L. Potência 1500W. Revestimento Gold. A página permite selecionar 127V ou 220V."},
{"type":"online","store":"Mercado Livre","url":"https://produto.mercadolivre.com.br/MLB-5721372404-fritadeira-air-fryer-britnia-baf45a-5l-1500w-_JM","notes":"Britânia BAF45A, 5L, 1500W. Conferir a voltagem disponível no anúncio antes da compra."},
{"type":"physical","store":"Casas Bahia","address":"Av. Bezerra de Menezes, 2380, São Gerardo, Fortaleza - CE, 60325-002","notes":"Procurar Britânia BAF45A 5L 1500W. Confirmar 127V/220V conforme a instalação."}
]$$::jsonb,null,null,'single',null,null
),
(
'f2000000-0000-4000-8000-000000000010','Eletrodomésticos','Cafeteira elétrica',
'Para começarmos os dias na casa nova com um café especial. Sugestão: Britânia CP30 Inox, 800W, capacidade de 1,2L, cor preto e inox, filtro permanente e sistema corta-pingos. Preferência pela versão 110V/127V, conforme a instalação da casa.',
169.90,
'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80',
'Disponível',null,'https://pagamento.example.com/cartao/cafeteira','Link de teste','LM-GIFT-210',
'hybrid',
$$[
{"type":"online","store":"Mercado Livre","url":"https://produto.mercadolivre.com.br/MLB-2940231780-cafeteira-britnia-cp30-inox-110-volts-_JM","notes":"Britânia CP30, preto e inox, 800W, 1,2L. Anúncio consultado na versão 110V."},
{"type":"physical","store":"Casas Bahia","address":"R. Gen. Sampaio, 1267, Centro, Fortaleza - CE, 60020-031","notes":"Procurar Britânia CP30 Inox, 800W, 1,2L, preto e inox. Confirmar versão 127V/220V antes da compra."}
]$$::jsonb,null,null,'single',null,null
)
on conflict (id) do update
set
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  card_payment_url = excluded.card_payment_url,
  card_payment_provider = excluded.card_payment_provider,
  card_payment_reference = excluded.card_payment_reference,
  purchase_mode = excluded.purchase_mode,
  external_purchase_options = excluded.external_purchase_options,
  gift_type = excluded.gift_type,
  quota_count = excluded.quota_count,
  quota_value = excluded.quota_value
where public.gifts.reserved_guest_id is null
  and not exists (
    select 1
    from public.gift_contributions as contribution
    where contribution.gift_id = public.gifts.id
  );

commit;
