export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);

    fileReader.onerror = () => {
      fileReader.abort();
      reject(new DOMException('Error parsing file'));
    };

    fileReader.readAsArrayBuffer(file);
  });
}

export function fileToString(file: File): Promise<string> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as string);

    fileReader.onerror = () => {
      fileReader.abort();
      reject(new DOMException('Error parsing file'));
    };

    fileReader.readAsText(file);
  });
}