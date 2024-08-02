interface FileInputProps {
  accept: string;
  handleFiles: (files: FileList) => any;
  children?: React.ReactNode;
}

export default function FileInput({
  accept,
  handleFiles,
  children,
}: FileInputProps) {
  return (
    <div
      className="rounded-md border-2 border-dashed border-accent hover:border-primary hover:text-primary"
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
      <label className="flex h-36 flex-col items-center justify-center text-center hover:cursor-pointer">
        {children}

        <input
          className="hidden"
          type="file"
          id="attach"
          accept={accept}
          onChange={(e) => {
            const files = e.currentTarget.files;
            handleFiles(files);
          }}
          // capture="environment"
        ></input>
      </label>
    </div>
  );
}
