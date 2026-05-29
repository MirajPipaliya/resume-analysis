import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analysis from './Analysis';
import api from '../services/api';
import { vi } from 'vitest';

vi.mock('../services/api');

const renderWithProviders = (ui, { route = '/analysis/1' } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/analysis/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Analysis Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders loading state initially', () => {
    // Provide a promise that doesn't resolve immediately to keep it in loading state
    api.get.mockImplementation(() => new Promise(() => {}));
    
    const { container } = renderWithProviders(<Analysis />);
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });

  test('renders ATS optimization section when data is present', async () => {
    const mockData = {
      data: {
        data: {
          parsed_data: { name: 'Jane Doe' },
          score_data: {
            overall_score: 85,
            ats_optimization: {
              missing_keywords: ['React', 'Node'],
              actionable_tips: ['Add more metrics']
            }
          }
        }
      }
    };
    api.get.mockResolvedValue(mockData);

    renderWithProviders(<Analysis />);

    // Wait for the name to appear
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // Check ATS Optimization section
    expect(screen.getByText('ATS Optimization Tips')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Add more metrics')).toBeInTheDocument();
  });

  test('renders error state correctly when no analysis found', async () => {
    api.get.mockRejectedValue(new Error('Not found'));

    renderWithProviders(<Analysis />);

    await waitFor(() => {
      expect(screen.getByText('Analysis not found')).toBeInTheDocument();
    });
  });
});
