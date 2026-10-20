import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

const VAL = 'valentina.rios@correo.usbcali.edu.co';

function setup() {
  window.location.hash = '#/';
  return { user: userEvent.setup(), ...render(<App />) };
}

async function signIn(user: ReturnType<typeof userEvent.setup>, email = VAL, password = 'usb2026') {
  await user.click(screen.getAllByRole('link', { name: 'Iniciar sesión' })[0]!);
  await user.type(screen.getByLabelText('Correo institucional'), email);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('acceso', () => {
  it('muestra errores distintos y conserva el correo', async () => {
    const { user } = setup();
    await signIn(user, 'alguien@gmail.com', 'x');
    expect(await screen.findByRole('alert')).toHaveTextContent('usbcali.edu.co');
    expect(screen.getByLabelText('Correo institucional')).toHaveValue('alguien@gmail.com');
  });

  it('inicia sesión y lleva a Explorar con los 7 espacios', async () => {
    const { user } = setup();
    await signIn(user);
    expect(await screen.findByRole('heading', { name: /Hola, Valentina/ })).toBeInTheDocument();
    expect(document.querySelectorAll('.dirrow')).toHaveLength(7);
  });

  it('protege las pantallas internas y retoma la ruta pedida', async () => {
    const { user } = setup();
    window.location.hash = '#/mis-reservas';
    await screen.findByRole('heading', { name: 'Inicia sesión' });
    await user.click(screen.getByRole('button', { name: 'Entrar como Valentina' }));
    expect(await screen.findByRole('heading', { name: 'Mis reservas' })).toBeInTheDocument();
  });

  it('al cerrar sesión vuelve a la portada', async () => {
    const { user } = setup();
    await signIn(user);
    await screen.findByRole('heading', { name: /Hola, Valentina/ });
    window.location.hash = '#/perfil';
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reserva y comparte');
  });
});

describe('reserva', () => {
  it('reserva una franja libre, muestra el resumen y entrega el comprobante', async () => {
    const { user } = setup();
    await signIn(user);
    await screen.findByRole('heading', { name: /Hola, Valentina/ });

    window.location.hash = '#/espacio/b310?dia=2';
    await screen.findByRole('heading', { level: 1, name: 'Sala de estudio B-310' });

    const agenda = document.querySelector('.agenda') as HTMLElement;
    const rows = within(agenda).getAllByRole('button');
    const target = rows.find((row) => row.textContent?.includes('Libre'))!;
    expect(target).toBeDefined();
    await user.click(target);
    await user.click(screen.getByRole('button', { name: 'Reservar el espacio completo' }));

    const dialog = await screen.findByRole('dialog', { name: 'Revisa tu reserva' });
    expect(within(dialog).getByText('Espacio completo')).toBeInTheDocument();
    expect(within(dialog).queryByText('Compartes con')).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar reserva' }));

    expect(await screen.findByRole('heading', { name: 'Reserva confirmada' })).toBeInTheDocument();
    expect(document.querySelector('.ticket__code')).toHaveTextContent(/RSV-4912/);
    expect(screen.getByRole('link', { name: 'Liberar una parte' })).toBeInTheDocument();
  });

  it('cerrar el resumen con Escape no reserva nada', async () => {
    const { user } = setup();
    await signIn(user);
    await screen.findByRole('heading', { name: /Hola, Valentina/ });
    window.location.hash = '#/espacio/b310?dia=2';
    await screen.findByRole('heading', { level: 1, name: 'Sala de estudio B-310' });
    const agenda = document.querySelector('.agenda') as HTMLElement;
    await user.click(
      within(agenda)
        .getAllByRole('button')
        .find((r) => r.textContent?.includes('Libre'))!,
    );
    await user.click(screen.getByRole('button', { name: 'Reservar el espacio completo' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(window.location.hash).toBe('#/espacio/b310?dia=2');
  });
});

describe('mis reservas', () => {
  it('pide confirmación antes de cancelar', async () => {
    const { user } = setup();
    await signIn(user);
    await screen.findByRole('heading', { name: /Hola, Valentina/ });
    window.location.hash = '#/mis-reservas';
    await screen.findByRole('heading', { name: 'Mis reservas' });

    const card = screen.getByText('RSV-4907').closest('article')!;
    await user.click(within(card).getByRole('button', { name: 'Cancelar' }));
    const dialog = await screen.findByRole('alertdialog', { name: '¿Cancelar esta reserva?' });
    await user.click(within(dialog).getByRole('button', { name: 'Mantener reserva' }));
    expect(screen.getByText('RSV-4907')).toBeInTheDocument();

    await user.click(within(card).getByRole('button', { name: 'Cancelar' }));
    await user.click(await screen.findByRole('button', { name: 'Sí, cancelar reserva' }));
    await waitFor(() => expect(screen.queryByText('RSV-4907')).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Reserva cancelada');
  });
});

describe('promedio', () => {
  it('rechaza valores fuera de rango y guarda uno válido', async () => {
    const { user } = setup();
    await signIn(user, 'laura.mejia@correo.usbcali.edu.co');
    await screen.findByRole('heading', { name: /Hola, Laura/ });
    window.location.hash = '#/perfil';
    const input = await screen.findByLabelText('Promedio de notas');
    await user.type(input, '6');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('entre 0,0 y 5,0');
    expect(screen.getByText('Sin dato')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '4,5');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(document.querySelector('.metrics')).toHaveTextContent('4,5');
  });
});
