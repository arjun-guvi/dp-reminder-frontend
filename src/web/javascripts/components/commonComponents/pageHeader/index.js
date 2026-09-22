// Page Header Component
import React from 'react';
import {
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import './pageHeader.scss';

const PageHeader = ({
  title = '',
  subtitle = '',
  breadcrumbs = [],
  actions,
}) => {
  return (
    <div className="page-header">
      <div className="page-header__info">
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator=">"
            className="page-header__breadcrumbs"
          >
            <Link href="/" color="inherit">
              Home
            </Link>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={item.id || index} color="text.primary">
                  {item.label}
                </Typography>
              ) : (
                <Link
                  key={item.id || index}
                  href={item.path || '#'}
                  color="inherit"
                >
                  {item.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <Typography variant="h4" className="page-header__title">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" className="page-header__subtitle">
            {subtitle}
          </Typography>
        )}
      </div>
      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
