// Verifica horário de funcionamento a cada minuto
function verificaHorarioDeFuncionamento() {
  const agora = new Date();

  const diasSemana = [
    'domingo',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado'
  ];

  const diaAtual = diasSemana[agora.getDay()];
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  const horarios = {
    domingo:  { abertura: [8, 0], fechamento: [22, 0] },
    segunda:  { abertura: [8, 0], fechamento: [22, 0] },
    terca:    { abertura: [0, 0], fechamento: [0, 9] },
    quarta:   { abertura: [8, 0], fechamento: [22, 0] },
    quinta:   { abertura: [8, 0], fechamento: [22, 0] },
    sexta:    { abertura: [8, 0], fechamento: [18, 0] },
    sabado:   { abertura: [18, 0], fechamento: [22, 0] }
  };

  const { abertura, fechamento } = horarios[diaAtual];

  const [horaAbertura, minutoAbertura] = abertura;
  const [horaFechamento, minutoFechamento] = fechamento;

  const foraDoHorario =
    horaAtual < horaAbertura ||
    (horaAtual === horaAbertura && minutoAtual < minutoAbertura) ||
    horaAtual > horaFechamento ||
    (horaAtual === horaFechamento && minutoAtual >= minutoFechamento);

  const estaNaPaginaFechada = window.location.pathname.includes('/fechado/');

  if (foraDoHorario && !estaNaPaginaFechada) {
    window.location.href = '../fechado/index.html';
  }

  if (!foraDoHorario && estaNaPaginaFechada) {
    window.location.href = '../index.html';
  }
}

setInterval(verificaHorarioDeFuncionamento, 60000);
verificaHorarioDeFuncionamento();