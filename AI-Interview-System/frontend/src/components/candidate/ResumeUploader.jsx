import { useState } from "react";

function ResumeUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      setFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setError("Resume file size must be less than 5 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !onUpload) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      await onUpload(file);

      setMessage("Resume uploaded successfully.");
      setFile(null);
    } catch (err) {
      console.error("Resume upload failed:", err);
      setError("Resume upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-uploader">
      <h3>Resume / CV</h3>

      <p>
        Upload your resume so the AI interviewer can consider your
        skills, projects, experience and qualifications.
      </p>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {file && (
        <div className="selected-file">
          <strong>Selected file:</strong> {file.name}
        </div>
      )}

      {error && (
        <div className="resume-error">
          {error}
        </div>
      )}

      {message && (
        <div className="resume-success">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload Resume"}
      </button>
    </div>
  );
}

export default ResumeUploader;