import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, Save } from 'lucide-react';

import { api, ErrorDeApi } from '../../lib/api';
import { formularioEquipo as copy } from '../../data/content';
import SelectDropdown from '../../components/ui/SelectDropdown';
import RatingScale from '../../components/ui/RatingScale';
import CampoMoneda from '../../components/ui/CampoMoneda';
import { formatearPesos } from '../../lib/formato';
import ImageUploader, { validarArchivo, MAXIMO_FOTOS } from '../../components/ui/ImageUploader';

const VACIO = {
  responsable: '',
  marca: '',
  marca_otra: '',
  procesador: '',
  procesador_otro: '',
  ram: '',
  almacenamiento_tipo: '',
  almacenamiento_capacidad: '',
  estado_bateria: '',
  estado_estetico: '',
  garantia_meses: '',
  costo_compra: '',
  precio_venta: '',
  notas_fallas: '',
};

const OBLIGATORIOS = [
  'responsable',
  'marca',
  'procesador',
  'ram',
  'almacenamiento_tipo',
  'almacenamiento_capacidad',
  'estado_bateria',
  'estado_estetico',
  'garantia_meses',
  'costo_compra',
  'precio_venta',
];

// Un equipo registrado hace poco con las mismas características probablemente sea
// el mismo cargado dos veces. Probablemente, no seguro: el aviso informa, no bloquea.
const DIAS_PARA_SOSPECHAR_DUPLICADO = 7;

let contadorFotos = 0;

export default function EquipoForm() {
  const navegar = useNavigate();

  const [opciones, setOpciones] = useState(null);
  const [datos, setDatos] = useState(VACIO);
  const [fotos, setFotos] = useState([]);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [equipoCreado, setEquipoCreado] = useState(null);
  const [registrados, setRegistrados] = useState([]);

  const contenedor = useRef(null);

  useEffect(() => {
    api.opciones().then(setOpciones).catch(() => setOpciones({}));
    api.equipos().then(setRegistrados).catch(() => setRegistrados([]));
  }, []);

  function cambiar(campo, valor) {
    setDatos((previos) => ({ ...previos, [campo]: valor }));
    setErrores((previos) => ({ ...previos, [campo]: undefined }));
    setAviso(null);
  }

  // --- Fotos ---

  function agregarFotos(archivos) {
    const nuevas = [];
    let problema = null;

    for (const archivo of archivos) {
      // Se valida ANTES de intentar subir: no tiene sentido gastarle los datos del
      // celular al técnico para que falle al llegar.
      const error = validarArchivo(archivo);
      if (error) {
        problema = error;
        continue;
      }

      contadorFotos += 1;
      nuevas.push({
        id: `foto-${contadorFotos}`,
        archivo,
        preview: URL.createObjectURL(archivo),
        estado: 'pendiente',
      });
    }

    setErrores((previos) => ({ ...previos, fotos: problema ?? undefined }));
    setFotos((previas) => [...previas, ...nuevas].slice(0, MAXIMO_FOTOS));
  }

  function quitarFoto(id) {
    setFotos((previas) => {
      const foto = previas.find((cada) => cada.id === id);
      if (foto) URL.revokeObjectURL(foto.preview);
      return previas.filter((cada) => cada.id !== id);
    });
  }

  function hacerPortada(id) {
    setFotos((previas) => {
      const elegida = previas.find((cada) => cada.id === id);
      if (!elegida) return previas;
      return [elegida, ...previas.filter((cada) => cada.id !== id)];
    });
  }

  async function subirFotos(idEquipo, pendientes) {
    let alguna_fallo = false;

    for (const [indice, foto] of pendientes.entries()) {
      setFotos((previas) =>
        previas.map((cada) => (cada.id === foto.id ? { ...cada, estado: 'subiendo' } : cada))
      );

      try {
        await api.subirFoto(idEquipo, foto.archivo, indice);
        setFotos((previas) =>
          previas.map((cada) => (cada.id === foto.id ? { ...cada, estado: 'lista' } : cada))
        );
      } catch {
        // Una foto que falla no arrastra a las demás ni obliga a empezar de nuevo.
        alguna_fallo = true;
        setFotos((previas) =>
          previas.map((cada) => (cada.id === foto.id ? { ...cada, estado: 'error' } : cada))
        );
      }
    }

    return !alguna_fallo;
  }

  async function reintentarFoto(id) {
    if (!equipoCreado) return;
    const foto = fotos.find((cada) => cada.id === id);
    if (!foto) return;

    const todasListas = await subirFotos(equipoCreado, [foto]);
    if (todasListas && fotos.every((cada) => cada.id === id || cada.estado === 'lista')) {
      navegar('/dashboard', { replace: true });
    }
  }

  // --- Validación y guardado ---

  function validar() {
    const encontrados = {};

    for (const campo of OBLIGATORIOS) {
      if (datos[campo] === '' || datos[campo] === null) {
        encontrados[campo] = copy.errores.obligatorio;
      }
    }

    if (datos.marca === 'otra' && !datos.marca_otra.trim()) {
      encontrados.marca_otra = copy.errores.obligatorio;
    }

    if (datos.procesador === 'otro' && !datos.procesador_otro.trim()) {
      encontrados.procesador_otro = copy.errores.obligatorio;
    }

    if (fotos.length === 0) {
      encontrados.fotos = copy.errores.sinFotos;
    }

    return encontrados;
  }

  function buscarDuplicado() {
    const limite = Date.now() - DIAS_PARA_SOSPECHAR_DUPLICADO * 24 * 60 * 60 * 1000;

    return registrados.find(
      (equipo) =>
        new Date(equipo.creado_en).getTime() >= limite &&
        equipo.marca === datos.marca &&
        equipo.procesador === datos.procesador &&
        equipo.ram === datos.ram &&
        equipo.almacenamiento_capacidad === datos.almacenamiento_capacidad
    );
  }

  async function enviar(evento) {
    evento.preventDefault();

    // El botón ya está deshabilitado mientras guarda; esto cubre además el envío
    // con Enter desde el teclado del celular.
    if (guardando) return;

    const encontrados = validar();

    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      setErrorGeneral(copy.errores.guardar);
      // Subir hasta el primer campo con problema, que en un formulario largo de
      // celular puede estar muy por encima de donde quedó el dedo.
      const primero = contenedor.current?.querySelector('[aria-invalid="true"], [data-error="true"]');
      primero?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrores({});
    setErrorGeneral(null);

    const costo = Number(datos.costo_compra);
    const precio = Number(datos.precio_venta);

    if (precio < costo && aviso?.tipo !== 'perdida') {
      setAviso({ tipo: 'perdida' });
      return;
    }

    const duplicado = buscarDuplicado();
    if (duplicado && aviso?.tipo !== 'duplicado' && aviso?.tipo !== 'perdida') {
      setAviso({ tipo: 'duplicado', equipo: duplicado });
      return;
    }

    setGuardando(true);

    try {
      const equipo = await api.crearEquipo(datos);
      setEquipoCreado(equipo.id);

      const todasListas = await subirFotos(equipo.id, fotos);

      if (todasListas) {
        navegar('/dashboard', { replace: true });
        return;
      }

      setErrorGeneral(copy.fotos.fallaron);
      setGuardando(false);
    } catch (fallo) {
      // Nada de lo que escribió se pierde: el estado del formulario se conserva
      // intacto y solo se muestra qué pasó.
      if (fallo instanceof ErrorDeApi && Object.keys(fallo.campos).length > 0) {
        const delServidor = {};
        for (const [campo, mensajes] of Object.entries(fallo.campos)) {
          delServidor[campo] = Array.isArray(mensajes) ? mensajes[0] : String(mensajes);
        }
        setErrores(delServidor);
      }

      setErrorGeneral(fallo.message);
      setGuardando(false);
    }
  }

  if (!opciones) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-dark">
        <Loader2 className="h-6 w-6 animate-spin text-brand-cyan" aria-hidden="true" />
        <span className="sr-only">Cargando el formulario…</span>
      </div>
    );
  }

  const costo = Number(datos.costo_compra || 0);
  const precio = Number(datos.precio_venta || 0);
  const margen = precio - costo;
  const hayMargen = datos.costo_compra !== '' && datos.precio_venta !== '';

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/dashboard"
            className="rounded-lg p-2 text-slate-400 transition hover:text-white"
            aria-label={copy.volver}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-display font-bold">{copy.titulo}</h1>
            <p className="text-xs text-slate-400">{copy.subtitulo}</p>
          </div>
        </div>
      </header>

      <form ref={contenedor} onSubmit={enviar} className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5">
          <SelectDropdown
            id="responsable"
            etiqueta={copy.campos.responsable}
            opciones={opciones.responsables}
            valor={datos.responsable}
            onChange={(valor) => cambiar('responsable', valor)}
            error={errores.responsable}
            obligatorio
          />

          <SelectDropdown
            id="marca"
            etiqueta={copy.campos.marca}
            opciones={opciones.marcas}
            valor={datos.marca}
            onChange={(valor) => cambiar('marca', valor)}
            error={errores.marca}
            obligatorio
          />

          {datos.marca === 'otra' && (
            <CampoTexto
              id="marca_otra"
              etiqueta={copy.campos.marcaOtra}
              valor={datos.marca_otra}
              onChange={(valor) => cambiar('marca_otra', valor)}
              error={errores.marca_otra}
            />
          )}

          <SelectDropdown
            id="procesador"
            etiqueta={copy.campos.procesador}
            opciones={opciones.procesadores}
            valor={datos.procesador}
            onChange={(valor) => cambiar('procesador', valor)}
            error={errores.procesador}
            obligatorio
          />

          {datos.procesador === 'otro' && (
            <CampoTexto
              id="procesador_otro"
              etiqueta={copy.campos.procesadorOtro}
              valor={datos.procesador_otro}
              onChange={(valor) => cambiar('procesador_otro', valor)}
              error={errores.procesador_otro}
            />
          )}

          <SelectDropdown
            id="ram"
            etiqueta={copy.campos.ram}
            opciones={opciones.rams}
            valor={datos.ram}
            onChange={(valor) => cambiar('ram', valor)}
            error={errores.ram}
            obligatorio
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectDropdown
              id="almacenamiento_tipo"
              etiqueta={copy.campos.almacenamientoTipo}
              opciones={opciones.almacenamiento_tipos}
              valor={datos.almacenamiento_tipo}
              onChange={(valor) => cambiar('almacenamiento_tipo', valor)}
              error={errores.almacenamiento_tipo}
              obligatorio
            />

            <SelectDropdown
              id="almacenamiento_capacidad"
              etiqueta={copy.campos.almacenamientoCapacidad}
              opciones={opciones.almacenamiento_capacidades}
              valor={datos.almacenamiento_capacidad}
              onChange={(valor) => cambiar('almacenamiento_capacidad', valor)}
              error={errores.almacenamiento_capacidad}
              obligatorio
            />
          </div>

          <SelectDropdown
            id="estado_bateria"
            etiqueta={copy.campos.estadoBateria}
            opciones={opciones.estados_bateria}
            valor={datos.estado_bateria}
            onChange={(valor) => cambiar('estado_bateria', valor)}
            error={errores.estado_bateria}
            obligatorio
          />

          <RatingScale
            id="estado_estetico"
            etiqueta={copy.campos.estadoEstetico}
            opciones={opciones.estados_esteticos}
            valor={datos.estado_estetico}
            onChange={(valor) => cambiar('estado_estetico', valor)}
            error={errores.estado_estetico}
            obligatorio
          />

          <SelectDropdown
            id="garantia_meses"
            etiqueta={copy.campos.garantia}
            opciones={opciones.garantias_meses}
            valor={datos.garantia_meses}
            onChange={(valor) => cambiar('garantia_meses', valor)}
            error={errores.garantia_meses}
            obligatorio
          />

          <CampoMoneda
            id="costo_compra"
            etiqueta={copy.campos.costo}
            ayuda={copy.campos.costoAyuda}
            valor={datos.costo_compra}
            onChange={(valor) => cambiar('costo_compra', valor)}
            error={errores.costo_compra}
            obligatorio
          />

          <CampoMoneda
            id="precio_venta"
            etiqueta={copy.campos.precio}
            valor={datos.precio_venta}
            onChange={(valor) => cambiar('precio_venta', valor)}
            error={errores.precio_venta}
            obligatorio
          />

          {hayMargen && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                margen < 0
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                  : 'border-white/10 bg-brand-surface text-slate-300'
              }`}
            >
              <span className="font-medium">{copy.margen.etiqueta}: </span>
              <span className="font-display font-bold">${formatearPesos(margen)}</span>
              {margen < 0 && <p className="mt-1 text-xs">{copy.margen.perdida}</p>}
            </div>
          )}

          <ImageUploader
            fotos={fotos}
            onAgregar={agregarFotos}
            onQuitar={quitarFoto}
            onHacerPortada={hacerPortada}
            onReintentar={reintentarFoto}
            error={errores.fotos}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notas_fallas" className="text-sm font-medium text-slate-300">
              {copy.campos.notas}
            </label>
            <textarea
              id="notas_fallas"
              rows={4}
              value={datos.notas_fallas}
              onChange={(evento) => cambiar('notas_fallas', evento.target.value)}
              className="rounded-xl border border-white/10 bg-brand-surface px-4 py-3 text-base text-white outline-none transition focus:border-brand-cyan"
            />
            <p className="text-xs text-slate-500">{copy.campos.notasAyuda}</p>
          </div>

          {aviso && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {aviso.tipo === 'perdida'
                  ? copy.avisos.perdidaTitulo
                  : copy.avisos.duplicadoTitulo}
              </p>
              <p className="mt-1 text-xs">
                {aviso.tipo === 'perdida' ? copy.avisos.perdidaTexto : copy.avisos.duplicadoTexto}
                {aviso.tipo === 'duplicado' && (
                  <span className="mt-1 block font-medium">{aviso.equipo.resumen_specs}</span>
                )}
              </p>
            </div>
          )}

          {errorGeneral && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorGeneral}
            </p>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="mt-2 inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-brand-cyan px-4 font-semibold text-brand-darker transition hover:brightness-110 disabled:opacity-60"
          >
            {guardando ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-5 w-5" aria-hidden="true" />
            )}
            {guardando
              ? copy.botonGuardando
              : aviso
                ? copy.avisos.confirmar
                : copy.boton}
          </button>
        </div>
      </form>
    </div>
  );
}

function CampoTexto({ id, etiqueta, valor, onChange, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {etiqueta}
        <span className="ml-1 text-brand-cyan">*</span>
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(error)}
        className={`min-h-[3rem] rounded-xl border bg-brand-surface px-4 text-base text-white outline-none transition focus:border-brand-cyan ${
          error ? 'border-red-400' : 'border-white/10'
        }`}
      />
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
