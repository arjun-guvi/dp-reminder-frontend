// Pagination Component
import {
  TablePagination,
  Typography,
} from '@mui/material';
import './pagination.scss';

const Pagination = ({
  page = 0,
  count = 0,
  rowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  onPageChange,
  onRowsPerPageChange,
  showTotalCount = true,
}) => {
  const handlePageChange = (event, newPage) => {
    onPageChange?.(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onRowsPerPageChange?.(newRowsPerPage);
  };

  return (
    <div className="pagination">
      {showTotalCount && (
        <Typography variant="body2" color="text.secondary">
          Total: {count} items
        </Typography>
      )}
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        showFirstButton
        showLastButton
      />
    </div>
  );
};

export default Pagination;
