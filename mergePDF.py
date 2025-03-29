import os
from pypdf import PdfWriter

# Folder containing PDFs
pdf_folder = "/home/bhaskar/Downloads/Allure" #Location of the file

# Get all PDF files sorted
pdf_files = sorted([os.path.join(pdf_folder, f) for f in os.listdir(pdf_folder) if f.endswith(".pdf")])

# Initialize PdfWriter
writer = PdfWriter()

# Merge all PDFs
for pdf in pdf_files:
    writer.append(pdf)

# Save the merged PDF
output_file = "merged_allure.pdf"
writer.write(output_file)
writer.close()

print(f"Merged PDF saved as: {output_file}")
