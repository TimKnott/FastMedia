import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Normalizes URLs by stripping a trailing slash (except the root "/").
 * SiteGuru flagged /path and /path/ as duplicate content — this client-side
 * redirect collapses both variants onto the no-trailing-slash form so the
 * canonical tag and the URL bar agree.
 */
const TrailingSlashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const normalized = pathname.replace(/\/+$/, '');
      navigate(`${normalized}${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default TrailingSlashRedirect;
