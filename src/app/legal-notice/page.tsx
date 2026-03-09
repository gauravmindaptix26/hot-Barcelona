import DocumentPage from "@/components/DocumentPage";
import { legalNoticeContent } from "@/lib/document-content";

export default function LegalNoticePage() {
  return <DocumentPage content={legalNoticeContent} />;
}
