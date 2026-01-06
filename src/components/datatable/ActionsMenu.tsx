// src/components/datatable/ActionMenu.tsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiDotsVertical } from "react-icons/hi";
import type { ReactNode } from "react";

export interface ActionMenuItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string; // color personalizado para el botón (ej: "text-[#2affd6]")
  iconColor?: string; // color personalizado para el icono (ej: "text-[#2affd6]")
  hoverColor?: string; // color al hacer hover (por defecto: "hover:bg-[#1a1a22]")
}

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  actions: ActionMenuItem[]; // nuevo: arreglo de acciones
}

export default function ActionMenu({
  isOpen,
  onToggle,
  onClose,
  actions,
}: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 4;
    const menuHeight = actions.length * 50 + 20; // calcula altura dinámicamente

    let top = rect.bottom + margin;
    // si se sale por abajo, lo subimos
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - margin;
    }

    setPos({
      x: rect.right - 160, // ajusta horizontal si quieres
      y: top,
    });

    onToggle();
  };

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return; // el click fue en el botón, ya lo maneja handleOpen
      }
      if (menuRef.current && menuRef.current.contains(target)) {
        return; // click dentro del menú
      }
      onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className="p-2 text-[#3affdd] hover:text-[#7afff0] hover:bg-[#1a1a22] rounded-full transition shadow-[0_0_15px_rgba(0,255,200,0.2)]"
      >
        <HiDotsVertical size={20} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-9999 rounded-lg bg-[#0f0f14] border border-[#1f1f24] shadow-[0px_2px_22px_rgba(0,255,200,0.15)] overflow-hidden backdrop-blur-md"
            style={{
              top: pos.y,
              left: pos.x,
              minWidth: "180px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm ${
                  action.hoverColor || "hover:bg-[#1a1a22]"
                } ${action.color || "text-[#c7fff4]"} transition`}
              >
                <span className={action.iconColor || ""}>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
