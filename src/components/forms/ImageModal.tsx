import { BiX } from "react-icons/bi";
import Modal from "../Modal";

interface ImageModalProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEventHandler<HTMLElement>) => any;
  imageSrc?: string;
}

/**
 * A minimal modal to view image.
 *
 * @param imageSrc What goes into the `src` attribute of the `<img>`
 */
export default function ImageModal({
  isOpen,
  imageSrc,
  onClose,
}: ImageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="min-h-20 min-w-20 max-w-screen-lg">
        <button
          type="button"
          className="btn btn-circle btn-accent btn-sm absolute right-4 top-4"
          onClick={() => {
            onClose();
          }}
        >
          <span>
            <BiX className="h-6 w-6"></BiX>
          </span>
        </button>
        <img src={imageSrc}></img>
      </div>
    </Modal>
  );
}
