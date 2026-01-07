import React, { useEffect, useMemo, useState } from 'react';

interface ColumnType {
  name: React.ReactNode;
  sortable?: boolean;
  center?: boolean;
  exportable?: boolean;
  selector?: (row: any) => any;
  formatToExport?: (row: any) => any;
  cell?: (row: any) => React.ReactNode;
  width?: number;
  filterColumn?: boolean;
}

interface DataTableProps {
  columns: Array<ColumnType>;
  data: Array<any>;
  filters?: Array<React.ReactNode>;
  showDates?: boolean;
  showExport?: boolean;
  onExport?: (format: 'csv' | 'excel') => void;
  extraExportActions?: React.ReactNode;
  singleAccounts?: boolean;
  filter?: (row: any, term: string) => boolean;
  hideAccountsFilter?: boolean;
  isLoading?: boolean;
  order?: { columnIndex: number; direction: 'asc' | 'desc' }; // orden inicial opcional
}

function DataTable(props: DataTableProps) {
  // Textos fijos en lugar de useTranslation
  const TEXTS = {
    searchPlaceholder: 'Buscar...',
    emptyRecords: 'No hay registros para mostrar',
    zeroRecords: 'No se encontraron registros que coincidan con la búsqueda',
    lengthMenu: 'registros por página',
    of: 'de'
  };

  const [hideColumns] = useState<boolean[]>([]);
  const [columns, setColumns] = useState<Array<ColumnType>>(props.columns);
  const [rows, setRows] = useState<Array<any>>(props.data);
  const [term, setTerm] = useState<string>('');
  const [filtersColumns, setFiltersColumns] = useState<string[]>([]);

  const getInitialSort = () => {
    if (props.order) return props.order;
    return { columnIndex: 0, direction: 'desc' as const };
  };

  const [sortConfig, setSortConfig] = useState(getInitialSort);

  const [paginationConfig, setPaginationConfig] = useState<{
    totalPages: number;
    currentPage: number;
    rowsPerPage: number;
    isFirst: boolean;
    isLast: boolean;
    rows: React.ReactNode[];
  }>({
    totalPages: 1,
    currentPage: 0,
    rowsPerPage: 10,
    isFirst: true,
    isLast: false,
    rows: []
  });

  useEffect(() => {
    setFiltersColumns(new Array(props.columns.length).fill(''));
  }, [props.columns.length]);

  useEffect(() => {
    setColumns(props.columns);
    setRows(props.data);
  }, [props.columns, props.data]);

  const columnsFiltered = useMemo(
    () => columns.filter((_, index) => !hideColumns[index]),
    [columns, hideColumns]
  );

  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    const { columnIndex, direction } = sortConfig;
    const col = columns[columnIndex];
    if (!col) return rows;

    return [...rows].sort((a, b) => {
      const aValue = col.selector ? col.selector(a) : a;
      const bValue = col.selector ? col.selector(b) : b;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue ?? '').toLowerCase();
      const bStr = String(bValue ?? '').toLowerCase();

      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig, columns]);

  const filteredRows = useMemo(
    () =>
      sortedRows.filter((row) => {
        if (term) {
          if (props.filter) {
            if (!props.filter(row, term)) return false;
          } else {
            const searchKeys = Object.values(row).join(' ').toLowerCase();
            if (!searchKeys.includes(term.toLowerCase())) return false;
          }
        }

        for (let i = 0; i < filtersColumns.length; i++) {
          const filterVal = filtersColumns[i];
          if (filterVal) {
            const col = columns[i];
            if (!col) continue;
            const cellVal = col.selector ? col.selector(row) : '';
            if (!String(cellVal).toLowerCase().includes(filterVal.toLowerCase())) {
              return false;
            }
          }
        }
        return true;
      }),
    [sortedRows, term, filtersColumns, props.filter, columns]
  );

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredRows.length / paginationConfig.rowsPerPage)
    );
    
    // Mantener la página actual si es válida, sino resetear a 0
    const currentPage = paginationConfig.currentPage >= totalPages 
      ? 0 
      : paginationConfig.currentPage;
    
    const start = currentPage * paginationConfig.rowsPerPage;
    const rows = filteredRows
      .slice(start, start + paginationConfig.rowsPerPage)
      .map((row, index) => (
        <tr key={index} className="border-b last:border-b-0 hover:bg-slate-800">
          {columnsFiltered.map((column, indexCol) => (
            <td
              key={`row-${index}-col-${indexCol}`}
              className={
                'px-4 py-2 text-sm text-slate-200 ' +
                (column.center ? 'text-center' : 'text-left')
              }
            >
              {column.cell ? column.cell(row) : (column.selector && column.selector(row)) || ''}
            </td>
          ))}
        </tr>
      ));

    setPaginationConfig((prevConfig) => ({
      ...prevConfig,
      totalPages,
      currentPage,
      isFirst: currentPage === 0,
      isLast: currentPage === totalPages - 1 || totalPages <= 1,
      rows
    }));
  }, [filteredRows, paginationConfig.rowsPerPage, columnsFiltered]);

  const handleNextPrevPage = (action: 'prev' | 'next' | 'first' | 'last') => {
    let currentPage = paginationConfig.currentPage;
    switch (action) {
      case 'prev':
        currentPage--;
        break;
      case 'next':
        currentPage++;
        break;
      case 'first':
        currentPage = 0;
        break;
      case 'last':
        currentPage = paginationConfig.totalPages - 1;
        break;
    }
    if (currentPage < 0) currentPage = 0;
    if (currentPage >= paginationConfig.totalPages) {
      currentPage = paginationConfig.totalPages - 1;
    }

    const isFirst = currentPage === 0;
    const isLast = currentPage === paginationConfig.totalPages - 1;

    const start = currentPage * paginationConfig.rowsPerPage;
    const rows = filteredRows
      .slice(start, start + paginationConfig.rowsPerPage)
      .map((row, index) => (
        <tr key={index} className="border-b last:border-b-0 hover:bg-slate-800">
          {columnsFiltered.map((column, indexCol) => (
            <td
              key={`row-${index}-col-${indexCol}`}
              className={
                'px-4 py-2 text-sm text-slate-200 ' +
                (column.center ? 'text-center' : 'text-left')
              }
            >
              {column.cell ? column.cell(row) : (column.selector && column.selector(row)) || ''}
            </td>
          ))}
        </tr>
      ));

    setPaginationConfig({
      ...paginationConfig,
      currentPage,
      isFirst,
      isLast,
      rows
    });
  };

  const handleSortClick = (index: number) => {
    if (!columns[index].sortable) return;

    setSortConfig((currentSort) => {
      if (currentSort && currentSort.columnIndex === index) {
        const newDir = currentSort.direction === 'asc' ? 'desc' : 'asc';
        return { columnIndex: index, direction: newDir };
      }
      return { columnIndex: index, direction: 'asc' };
    });
  };

  const renderSortIcon = (index: number) => {
    const isActive = sortConfig && sortConfig.columnIndex === index;
    const direction = isActive ? sortConfig!.direction : null;
    const activeColor = '#1B5451';
    const inactiveColor = 'rgba(107,114,128,0.4)'; // gris clarito

    return (
      <div className="flex flex-col items-center ml-1 leading-none">
        <span
          style={{
            color: isActive && direction === 'asc' ? activeColor : inactiveColor,
            fontSize: '0.6rem',
            marginBottom: '-0.35rem'
          }}
        >
          ▲
        </span>
        <span
          style={{
            color: isActive && direction === 'desc' ? activeColor : inactiveColor,
            fontSize: '0.6rem',
            marginTop: '0.1rem'
          }}
        >
          ▼
        </span>
      </div>
    );
  };

  const handleColumnFilterChange = (index: number, value: string) => {
    setFiltersColumns((prev) => {
      const newFilters = [...prev];
      newFilters[index] = value;
      return newFilters;
    });
  };

  const getHeaders = useMemo(
    () =>
      columnsFiltered.map((column, idx) => {
        const realIndex = columns.findIndex((col) => col === column);
        const hasFilter = column.filterColumn;

        return (
          <th
            key={idx}
            scope="col"
            className={[
              'px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 bg-slate-900 align-top border-b border-slate-700',
              column.center ? 'text-center' : 'text-left',
              column.sortable ? 'cursor-pointer select-none' : ''
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              width: column.width ? `${column.width}%` : 'auto',
              minWidth: column.width ? `${column.width}%` : '150px',
              maxWidth: column.width ? `${column.width}%` : '200px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top'
            }}
            onClick={() => handleSortClick(realIndex)}
          >
            <div className="flex flex-col items-stretch gap-1">
              <div className="flex items-center justify-between gap-2">
                <span>{column.name}</span>
                {renderSortIcon(realIndex)}
              </div>

              {hasFilter && (
                <input
                  type="text"
                  value={filtersColumns[realIndex] || ''}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleColumnFilterChange(realIndex, e.target.value)}
                  placeholder="Filtrar"
                  className="mt-1 w-full rounded-md border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                />
              )}
            </div>
          </th>
        );
      }),
    [columnsFiltered, filtersColumns, sortConfig, columns]
  );

  if (props.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-slate-400 text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center relative my-2 mb-6">
        <span className="absolute left-3 text-slate-400 pointer-events-none">🔍</span>
        <input
          className="w-64 pl-9 pr-3 py-2 rounded-md border border-slate-700 bg-transparent text-sm text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
          placeholder={TEXTS.searchPlaceholder}
          type="text"
          value={term}
          onChange={({ target: { value } }) => setTerm(value)}
        />
      </div>

      <div className="relative">
          {rows.length === 0 && (
            <div className="text-center p-4">
              <p className="mb-0 text-sm text-slate-400">{TEXTS.emptyRecords}</p>
            </div>
          )}
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-transparent">
          <table className="min-w-full text-sm">
            <thead>
              <tr>{getHeaders}</tr>
            </thead>
            <tbody>{paginationConfig.rows}</tbody>
          </table>
        </div>
      )}

      {filteredRows.length === 0 && rows.length > 0 && (
        <div className="text-center p-4">
          <p className="mb-0 text-sm text-slate-400">{TEXTS.zeroRecords}</p>
        </div>
      )}

      {rows.length > 0 && (
        <nav className="mt-4 flex items-center justify-between gap-4">
          {/* Selector de filas por página */}
          <div className="flex items-center gap-2">
            <select
              title="select"
              className="ml-2 rounded-md border border-slate-700 bg-white px-2 py-1 text-xs text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
              onChange={({ target: { value } }) =>
                setPaginationConfig({ ...paginationConfig, rowsPerPage: +value })
              }
              value={paginationConfig.rowsPerPage}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
            </select>
            <small className="text-slate-300 text-xs">{TEXTS.lengthMenu}</small>
          </div>

          <div className="flex items-center gap-2">
            <small className="text-slate-300 text-xs">
              {paginationConfig.currentPage * paginationConfig.rowsPerPage + 1} -{' '}
              {Math.min(
                (paginationConfig.currentPage + 1) * paginationConfig.rowsPerPage,
                filteredRows.length
              )}{' '}
              {TEXTS.of} {filteredRows.length}
            </small>

            <button
              type="button"
              className="mx-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={paginationConfig.isFirst}
              onClick={() => handleNextPrevPage('first')}
              title="Primera página"
            >
              «
            </button>
            <button
              type="button"
              className="mx-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={paginationConfig.isFirst}
              onClick={() => handleNextPrevPage('prev')}
              title="Página anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="mx-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={paginationConfig.isLast}
              onClick={() => handleNextPrevPage('next')}
              title="Página siguiente"
            >
              ›
            </button>
            <button
              type="button"
              className="mx-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={paginationConfig.isLast}
              onClick={() => handleNextPrevPage('last')}
              title="Última página"
            >
              »
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

export default DataTable;
