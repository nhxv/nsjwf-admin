interface FileInputProps {
  accept: string;
  handleFiles: (files: FileList) => any;
}

export default function FileInput({ accept, handleFiles }: FileInputProps) {
  return (
    <div
      className="h-72 w-full bg-white outline-dotted"
      onDragEnter={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();

        const dt = e.dataTransfer;
        const files = dt.files;

        handleFiles(files);
      }}
    >
      <label>
        Upload something, just anything
        <input
          className="hidden"
          type="file"
          id="attach"
          accept={accept}
          onChange={(e) => {
            const files = e.currentTarget.files;
            handleFiles(files);
          }}
        ></input>
      </label>
    </div>
  );
}
