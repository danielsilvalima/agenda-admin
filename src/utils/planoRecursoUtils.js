export function validaPlanoRecurso(planoRecurso, lista) {
  if (!planoRecurso || !Array.isArray(lista)) {
    return true; // Se não houver plano ou lista, desabilita o botão
  }

  const plano = Number(planoRecurso);

  switch (plano) {
    case 1:
      return !(lista.length >= 0 && lista.length <= 1); // Deve ser exatamente 1 recurso

    case 2:
      return !(lista.length >= 0 && lista.length <= 5); // Deve ter entre 2 e 5 recursos

    case 3:
      return !(lista.length >= 0 && lista.length <= 15); // Deve ter entre 6 e 15 recursos

    case 4:
      return !(lista.length >= 0); // Deve ter pelo menos 16 recursos

    default:
      return true; // Caso o plano seja inválido, desabilita o botão
  }
}
