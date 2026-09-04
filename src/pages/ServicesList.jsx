import useSEO from '../hooks/useSEO';
import React from 'react';
import { Link } from 'react-router-dom';
import services from '../data/services.json';

export default function ServicesList() {
  useSEO({ title: 'ServicesList - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'ServicesList, Loan, Avani Finserv, Latur' });

  return (
    <div className="container services-list">
      <h1>Our Loan Products</h1>
      <ul>
        {services.map((s) => (
          <li key={s.slug}>
            <Link to={`/services/${s.slug}`}>{s.h1}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
