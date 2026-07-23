import SgdsTable from "@govtechsg/sgds-web-component/react/table";

export default function DataTable({ children, className = "" }) {
  return (
    <SgdsTable
      responsive="always"
      headerBackground
      tableBorder = {false}
      className={className}
    >
      {children}
    </SgdsTable>
  );
}
